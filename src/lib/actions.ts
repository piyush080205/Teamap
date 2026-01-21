'use server';

import {
  // We only need the types now, not the function itself.
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

  // Bypassing real AI validation and returning mock data.
  const mockData: ValidateIncidentWithAIOutput = {
    isAuthentic: true, // To ensure status becomes "Verifying"
    authenticityConfidence: Math.random() * (0.95 - 0.7) + 0.7, // Random score between 0.7 and 0.95
    summary: 'Mock AI analysis. Validation is currently bypassed.',
  };

  return {
    success: true,
    message: 'Incident submitted with mock validation data.',
    data: mockData,
  };
}
