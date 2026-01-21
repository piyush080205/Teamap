'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition, useEffect, useRef } from 'react';
import {
  ChevronsUpDown,
  Loader2,
  MapPin,
  Camera,
  SwitchCamera,
  X,
  Video,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { submitIncidentForValidation } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { IncidentType, IncidentSeverity } from '@/lib/types';
import { getLocationFromCell } from '@/lib/unwired-actions';
import { useUser, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const incidentTypes: IncidentType[] = [
  'Accident',
  'Crime',
  'Fire',
  'Hazard',
  'Medical',
  'Weather',
  'Other',
];
const severityLevels: IncidentSeverity[] = ['Info', 'Warning', 'Critical'];
const helpOptions = ['Medical', 'Fire', 'Police', 'Rescue', 'Volunteers'];

const formSchema = z.object({
  incidentType: z.string({ required_error: 'Please select an incident type.' }),
  locationDescription: z
    .string()
    .min(10, 'Please provide more details about the location.'),
  description: z
    .string()
    .min(10, 'Please provide more details about the incident.'),
  severityLevel: z.string({
    required_error: 'Please select a severity level.',
  }),
  helpNeeded: z
    .array(z.string())
    .refine(value => value.some(item => item), {
      message: 'You have to select at least one item.',
    }),
  numberOfPeopleAffected: z.coerce.number().min(0),
  mcc: z.coerce.number().optional(),
  mnc: z.coerce.number().optional(),
  lac: z.coerce.number().optional(),
  cellId: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportIncidentForm() {
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const { toast } = useToast();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(
    null
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturedVideos, setCapturedVideos] = useState<string[]>([]);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoViewerOpen, setVideoViewerOpen] = useState(false);


  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();


  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const openCamera = async (mode: 'photo' | 'video', deviceId?: string) => {
    setCameraMode(mode);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Camera API not supported by this browser.');
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support the camera API.',
      });
      return;
    }
    try {
      const constraints = deviceId
        ? { video: { deviceId: { exact: deviceId } } }
        : { video: { facingMode: 'environment' } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCameraPermission(true);
      setIsCameraOpen(true);

      if (videoDevices.length === 0) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(cameras);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsCameraOpen(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description:
          'Please enable camera permissions in your browser settings.',
      });
    }
  };

  const handleSwitchCamera = () => {
    if (videoDevices.length > 1 && cameraMode) {
      const nextIndex = (currentDeviceIndex + 1) % videoDevices.length;
      setCurrentDeviceIndex(nextIndex);
      const nextDevice = videoDevices[nextIndex];

      stopCameraStream();
      openCamera(cameraMode, nextDevice.deviceId);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const drawText = (lat?: number, lon?: number) => {
      const timestamp = new Date().toLocaleString();
      context.fillStyle = 'white';
      context.font = '20px Arial';
      context.shadowColor = 'black';
      context.shadowBlur = 5;
      context.textAlign = 'left';

      const latLonText =
        lat && lon
          ? `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`
          : 'Location not available';
      context.fillText(latLonText, 15, canvas.height - 40);
      context.fillText(timestamp, 15, canvas.height - 15);

      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImages(prev => [...prev, dataUrl]);
      toast({ title: 'Photo Captured' });
      
      closeCamera();
    };

    navigator.geolocation.getCurrentPosition(
      position => {
        drawText(position.coords.latitude, position.coords.longitude);
      },
      () => {
        drawText();
      },
      { enableHighAccuracy: true }
    );
  };
  
  const closeCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCameraMode(null);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  const handleStartRecording = () => {
    if (videoRef.current?.srcObject) {
      setIsRecording(true);
      const stream = videoRef.current.srcObject as MediaStream;
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        if (blob.size > 5 * 1024 * 1024) { // 5MB limit
          toast({
            variant: 'destructive',
            title: 'File size limit exceeded',
            description: 'Video recording must be less than 5MB.',
          });
          closeCamera();
        } else {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            setCapturedVideos(prev => [...prev, reader.result as string]);
            toast({ title: 'Video Captured' });
            closeCamera();
          };
          reader.onerror = () => {
            console.error("Failed to read video blob");
            toast({
                variant: 'destructive',
                title: 'Recording Failed',
                description: 'Could not process the captured video.',
            });
            closeCamera();
          };
        }
      };

      recorder.start();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeVideo = (index: number) => {
    setCapturedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationDescription: '',
      description: '',
      helpNeeded: [],
      numberOfPeopleAffected: 0,
      mcc: '' as any,
      mnc: '' as any,
      lac: '' as any,
      cellId: '' as any,
      latitude: '' as any,
      longitude: '' as any,
    },
  });

  const handleGpsLocate = () => {
    setIsGpsLocating(true);
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'GPS Not Supported',
        description: 'Your browser does not support geolocation.',
      });
      setIsGpsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        form.setValue('latitude', latitude);
        form.setValue('longitude', longitude);
        toast({
          title: 'Location Found',
          description: `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(
            6
          )}`,
        });

        const apiKey = process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY;
        if (apiKey) {
          try {
            const response = await fetch(
              `https://api.stadiamaps.com/geocoding/v1/reverse?point.lat=${latitude}&point.lon=${longitude}&api_key=${apiKey}`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              const address = data.features[0].properties.label;
              form.setValue('locationDescription', address, {
                shouldValidate: true,
              });
              toast({
                title: 'Address Found',
                description: address,
              });
            } else {
              toast({
                variant: 'destructive',
                title: 'Address not found',
                description:
                  'Could not find a specific address for your location.',
              });
            }
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Address lookup failed',
              description:
                'Could not connect to the location service to find an address.',
            });
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'Missing API Key',
            description:
              'Stadia Maps API key is not configured for reverse geocoding.',
          });
        }

        setIsGpsLocating(false);
      },
      error => {
        toast({
          variant: 'destructive',
          title: 'Could Not Get Location',
          description: error.message,
        });
        setIsGpsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCellLocate = async () => {
    setIsLocating(true);
    const { mcc, mnc, lac, cellId } = form.getValues();

    if (!mcc || !mnc || !lac || !cellId) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description:
          'Please fill in all cell tower fields (MCC, MNC, LAC, Cell ID).',
      });
      setIsLocating(false);
      return;
    }

    const result = await getLocationFromCell({
      mcc: mcc,
      mnc: mnc,
      lac: lac,
      cid: cellId,
    });

    if (result.success && result.lat && result.lon) {
      form.setValue('latitude', result.lat);
      form.setValue('longitude', result.lon);
      toast({
        title: 'Location Pinpointed',
        description: `Lat: ${result.lat.toFixed(
          6
        )}, Lon: ${result.lon.toFixed(6)}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Location Not Found',
        description: result.message,
      });
    }

    setIsLocating(false);
  };

  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not Authenticated',
          description: 'You must be logged in to submit a report.',
        });
        return;
      }
  
      const submissionData = { ...values, photoDataUris: [...capturedImages, ...capturedVideos] };
  
      const validationResult = await submitIncidentForValidation(submissionData as any);
  
      if (!validationResult.success || !validationResult.data) {
        toast({
          variant: 'destructive',
          title: 'AI Validation Failed',
          description: validationResult.message,
        });
        return;
      }
  
      const { isAuthentic, summary, authenticityConfidence } = validationResult.data;
      
      const newIncident = {
        userId: user.uid,
        user: {
            name: user.displayName || 'Anonymous User',
            avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`,
        },
        incidentType: values.incidentType,
        locationDescription: values.locationDescription,
        description: values.description,
        severity: values.severityLevel,
        helpNeeded: values.helpNeeded,
        numberOfPeopleAffected: values.numberOfPeopleAffected,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        photoURL: submissionData.photoDataUris.length > 0 ? submissionData.photoDataUris[0] : null,
        status: isAuthentic ? 'Verifying' : 'Unverified',
        aiSummary: summary,
        authenticityConfidence: authenticityConfidence,
        isAuthentic: isAuthentic,
        timestamp: serverTimestamp(),
      };
  
      const incidentsCollectionRef = collection(firestore, 'incidents');
      
      addDoc(incidentsCollectionRef, newIncident)
        .catch((error) => {
          const permissionError = new FirestorePermissionError({
            path: incidentsCollectionRef.path,
            operation: 'create',
            requestResourceData: newIncident,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
  
      toast({
        title: 'Report Submitted',
        description: 'Your incident has been submitted for verification.',
      });
  
      form.reset();
      setCapturedImages([]);
      setCapturedVideos([]);
      router.push('/alerts');
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="incidentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type of incident" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {incidentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {severityLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="locationDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <div className="flex flex-col sm:flex-row gap-2">
                <FormControl>
                  <Input
                    placeholder="e.g., Near Marine Drive, facing the sea"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGpsLocate}
                  disabled={isGpsLocating}
                  className="shrink-0"
                >
                  {isGpsLocating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  Use My Location
                </Button>
              </div>
              <FormDescription>
                Describe the location or use your device's GPS for accuracy.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what happened..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="helpNeeded"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Help Needed</FormLabel>
                <FormDescription>
                  Select all types of assistance required.
                </FormDescription>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {helpOptions.map(item => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="helpNeeded"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={checked => {
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value?.filter(
                                        value => value !== item
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{item}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="numberOfPeopleAffected"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of People Affected</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div>
              <FormLabel>Photo/Video Evidence</FormLabel>
              <FormDescription>
                A photo or short video with location and timestamp is highly recommended. You can add up to 5 items.
              </FormDescription>
            </div>
            
            {isCameraOpen ? (
              <div className="space-y-2">
                {hasCameraPermission === false ? (
                  <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please enable camera permissions in your browser settings to use this feature.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full aspect-video rounded-md bg-muted"
                      autoPlay
                      muted
                      playsInline
                    />
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                        {cameraMode === 'photo' && (
                          <Button type="button" size="icon" onClick={handleCapture}>
                            <Camera className="h-5 w-5" />
                            <span className="sr-only">Capture Photo</span>
                          </Button>
                        )}
                        {cameraMode === 'video' && (
                           <Button type="button" variant={isRecording ? 'destructive' : 'default'} onClick={isRecording ? handleStopRecording : handleStartRecording}>
                             {isRecording ? 'Stop' : 'Record'}
                           </Button>
                        )}
                        {videoDevices.length > 1 && (
                          <Button type="button" size="icon" onClick={handleSwitchCamera}>
                            <SwitchCamera className="h-5 w-5" />
                            <span className="sr-only">Switch Camera</span>
                          </Button>
                        )}
                         <Button type="button" variant="secondary" onClick={closeCamera}>Cancel</Button>
                     </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-2">
                  {capturedImages.map((image, index) => (
                    <div key={`img-${index}`} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(image);
                          setImageViewerOpen(true);
                        }}
                        className="w-full aspect-square rounded-md overflow-hidden border p-0 block"
                      >
                        <img
                          src={image}
                          alt={`Captured incident ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                   {capturedVideos.map((video, index) => (
                    <div key={`vid-${index}`} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVideo(video);
                          setVideoViewerOpen(true);
                        }}
                        className="w-full aspect-square rounded-md overflow-hidden border p-0 block"
                      >
                        <video
                          src={video}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => removeVideo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {(capturedImages.length + capturedVideos.length) < 5 && (
                   <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openCamera('photo')}
                        disabled={isCameraOpen}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {capturedImages.length > 0 ? 'Add Photo' : 'Capture Photo'}
                      </Button>
                       <Button
                        type="button"
                        variant="outline"
                        onClick={() => openCamera('video')}
                        disabled={isCameraOpen}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        {capturedVideos.length > 0 ? 'Add Video' : 'Record Video'}
                      </Button>
                   </div>
                )}
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ChevronsUpDown className="h-4 w-4 mr-2" />
              Advanced: Locate with Cell Tower (for non-GPS devices)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4 animate-accordion-down">
            <p className="text-sm text-muted-foreground">
              If GPS is unavailable, you can try to get a location from
              cellular network information. This data is usually found in your
              device's network settings.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="mcc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MCC</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 310"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mnc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MNC</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 410"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LAC</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 2153"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cellId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cell ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 2345"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCellLocate}
              disabled={isLocating}
            >
              {isLocating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pinpoint Location from Cell Data
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} value={field.value ?? ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} value={field.value ?? ''} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>
      </form>
      <Dialog open={isImageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-3xl p-2">
          <img src={selectedImage ?? ''} alt="Captured incident" className="w-full h-auto rounded-md" />
        </DialogContent>
      </Dialog>
      <Dialog open={isVideoViewerOpen} onOpenChange={setVideoViewerOpen}>
        <DialogContent className="max-w-3xl p-2">
          {selectedVideo && (
            <video src={selectedVideo} className="w-full h-auto rounded-md" controls autoPlay loop />
          )}
        </DialogContent>
      </Dialog>
    </Form>
  );
}
