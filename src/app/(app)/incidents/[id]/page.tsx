'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import type { Incident } from '@/lib/types';
import { Loader2, User, MapPin, AlertTriangle, Shield, Check, HelpCircle, X, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type FirestoreIncident = Omit<Incident, 'timestamp' | 'location' | 'id'> & { 
  id: string;
  timestamp: Timestamp;
  latitude: number;
  longitude: number;
};

const severityVariantMap = {
  Critical: "destructive",
  Warning: "default",
  Info: "secondary",
} as const;

const severityIconMap = {
    Critical: <AlertTriangle className="h-4 w-4 text-destructive" />,
    Warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    Info: <AlertTriangle className="h-4 w-4 text-blue-500" />,
};

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { toast } = useToast();

  const incidentRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'incidents', id);
  }, [firestore, id]);

  const { data: rawIncident, isLoading, error } = useDoc<FirestoreIncident>(incidentRef);

  const incident: Incident | null = useMemo(() => {
    if (!rawIncident) return null;
    return {
      ...rawIncident,
      id: rawIncident.id,
      timestamp: rawIncident.timestamp?.toMillis() || Date.now(),
      location: {
        lat: rawIncident.latitude,
        lng: rawIncident.longitude,
      },
    };
  }, [rawIncident]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error loading incident</AlertTitle>
            <AlertDescription>
                There was a problem fetching the incident details. It may have been removed or there was a network issue.
            </AlertDescription>
        </Alert>
    );
  }

  if (!incident) {
    return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Incident Not Found</h3>
            <p className="text-muted-foreground">The incident you are looking for does not exist or may have been deleted.</p>
        </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true });
  const confidencePercent = (incident.authenticityConfidence ?? 0) * 100;

  const handleVerificationClick = (verificationType: string) => {
    toast({
      title: "Feedback Received",
      description: `You've marked this incident as "${verificationType}". Thank you!`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
            <div className="flex items-center gap-4">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{incident.type}</h1>
                <Badge variant={severityVariantMap[incident.severity] ?? 'secondary'} className="text-base">{incident.severity}</Badge>
            </div>
            <p className="text-muted-foreground text-lg">{incident.address}</p>
        </div>

        {incident.imageUrls && incident.imageUrls.length > 0 && (
            <Card>
                <CardContent className="p-2">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {incident.imageUrls.map((url, index) => (
                            <CarouselItem key={index}>
                                {url.includes('video') ? (
                                    <video src={url} className="w-full h-auto rounded-md" controls />
                                ) : (
                                    <Image
                                        src={url}
                                        alt={`Incident photo ${index + 1}`}
                                        width={1280}
                                        height={720}
                                        className="rounded-md object-cover w-full aspect-video"
                                    />
                                )}
                            </CarouselItem>
                            ))}
                        </CarouselContent>
                        {incident.imageUrls.length > 1 && (
                            <>
                                <CarouselPrevious className="ml-14" />
                                <CarouselNext className="mr-14" />
                            </>
                        )}
                    </Carousel>
                </CardContent>
            </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Incident Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-base">{incident.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                           <Clock className="h-4 w-4" /> <span>Reported {timeAgo}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Analysis</CardTitle>
                        <CardDescription>Automated analysis of the incident report.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-muted-foreground">Authenticity Score</span>
                                <span className="font-bold text-lg">{confidencePercent.toFixed(0)}%</span>
                            </div>
                            <Progress value={confidencePercent} className="h-3" />
                        </div>
                        {incident.aiSummary && (
                             <p className="text-sm text-foreground/80 pt-2 border-t">{incident.aiSummary}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Reporter</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                         <Avatar className="h-12 w-12 border">
                            <AvatarImage src={incident.user.avatarUrl} alt={incident.user.name} />
                            <AvatarFallback>{incident.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{incident.user.name}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Help Needed</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {incident.helpNeeded?.map(need => (
                            <Badge key={need} variant="outline">{need}</Badge>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Crowd Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">Can you verify this incident?</p>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" onClick={() => handleVerificationClick('Confirmed')}>
                                <Check className="mr-2 h-4 w-4" /> Yes, it's accurate
                            </Button>
                            <Button variant="outline" onClick={() => handleVerificationClick('Unsure')}>
                                <HelpCircle className="mr-2 h-4 w-4" /> I'm not sure
                            </Button>
                            <Button variant="outline" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => handleVerificationClick('False')}>
                                <X className="mr-2 h-4 w-4" /> No, this is false
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
