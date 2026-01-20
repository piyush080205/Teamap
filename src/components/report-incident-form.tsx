'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition } from 'react';
import { ChevronsUpDown, Loader2 } from 'lucide-react';

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
  photo: z.instanceof(File).optional(),
  mcc: z.coerce.number().optional(),
  mnc: z.coerce.number().optional(),
  lac: z.coerce.number().optional(),
  cellId: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function fileToDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = error => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

export function ReportIncidentForm() {
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationDescription: '',
      description: '',
      helpNeeded: [],
      numberOfPeopleAffected: 0,
    },
  });

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

    const result = await getLocationFromCell({ mcc, mnc, lac, cid: cellId });

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
      let photoDataUri =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent gif
      if (values.photo) {
        try {
          photoDataUri = await fileToDataURI(values.photo);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error processing image',
            description: 'Could not read the uploaded file.',
          });
          return;
        }
      }

      const submissionData = { ...values, photoDataUri };
      // @ts-ignore
      delete submissionData.photo;

      const result = await submitIncidentForValidation(submissionData);

      if (result.success) {
        toast({
          title: 'Report Submitted',
          description: result.message,
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: result.message,
        });
      }
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
              <FormControl>
                <Input
                  placeholder="e.g., Near City Hall, corner of Main St & 1st Ave"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be as specific as possible. Your current location will also be
                used.
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

          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo/Video Evidence</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={e => field.onChange(e.target.files?.[0])}
                  />
                </FormControl>
                <FormDescription>
                  Optional, but highly recommended for faster verification.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground">
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
    </Form>
  );
}
