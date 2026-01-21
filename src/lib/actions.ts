'use server';

import {
  validateIncidentWithAI,
  type ValidateIncidentWithAIOutput,
  type ValidateIncidentWithAIInput,
} from '@/ai/flows/validate-incident-with-ai';
import { z } from 'zod';

const formSchema = z.object({
  incidentType: z.string(),
  locationDescription: z
    .string()
    .min(10, 'Please provide more details about the location.'),
  description: z
    .string()
    .min(10, 'Please provide more details about the incident.'),
  severityLevel: z.string(),
  helpNeeded: z.array(z.string()).min(1, 'Please select at least one option.'),
  numberOfPeopleAffected: z.coerce.number().min(0),
  photoDataUris: z.array(z.string()).optional(),
  mcc: z.coerce.number().optional(),
  mnc: z.coerce.number().optional(),
  lac: z.coerce.number().optional(),
  cellId: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export async function submitIncidentForValidation(
  input: ValidateIncidentWithAIInput
): Promise<{
  success: boolean;
  message: string;
  data?: ValidateIncidentWithAIOutput;
}> {
  const parsed = formSchema.safeParse(input);

  if (!parsed.success) {
    console.error(
      'Form validation failed:',
      parsed.error.flatten().fieldErrors
    );
    return { success: false, message: 'Invalid form data provided.' };
  }

  try {
    console.log('Sending data to AI for validation...');
    const result = await validateIncidentWithAI(parsed.data);
    console.log('AI Validation Result:', result);
    // In a real app, you would save the incident and AI result to a database here.
    return {
      success: true,
      message: 'Incident is being validated by AI.',
      data: result,
    };
  } catch (error) {
    console.error('AI validation failed:', error);
    return { 
      success: false, 
      message: (error instanceof Error && error.message) || 'Could not validate the incident.' 
    };
  }
}
