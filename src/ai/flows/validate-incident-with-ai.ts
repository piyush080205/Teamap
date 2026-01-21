'use server';
/**
 * @fileOverview Validates an incident report using AI analysis of image/video evidence and incident metadata.
 *
 * - validateIncidentWithAI - A function that validates an incident report using AI.
 * - ValidateIncidentWithAIInput - The input type for the validateIncidentWithAI function.
 * - ValidateIncidentWithAIOutput - The return type for the validateIncidentWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateIncidentWithAIInputSchema = z.object({
  incidentType: z.string().describe('The type of incident being reported (e.g., accident, fire, crime).'),
  locationDescription: z.string().describe('A description of the incident location.'),
  photoDataUris: z
    .array(z.string())
    .optional()
    .describe(
      "Photos or videos of the incident, as an array of data URIs. Each URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('A detailed description of the incident.'),
  severityLevel: z.string().describe('The severity level of the incident (e.g., critical, warning, info).'),
  helpNeeded: z.array(z.string()).describe('The types of help needed (e.g., medical, fire, police).'),
  numberOfPeopleAffected: z.number().describe('The estimated number of people affected by the incident.'),
});
export type ValidateIncidentWithAIInput = z.infer<typeof ValidateIncidentWithAIInputSchema>;

const ValidateIncidentWithAIOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether the AI determines the incident report to be authentic.'),
  authenticityConfidence: z.number().describe('The AI confidence level (0-1) that the incident is authentic.'),
  summary: z.string().describe('A summary of the AI analysis of the incident report.'),
});
export type ValidateIncidentWithAIOutput = z.infer<typeof ValidateIncidentWithAIOutputSchema>;

export async function validateIncidentWithAI(input: ValidateIncidentWithAIInput): Promise<ValidateIncidentWithAIOutput> {
  return validateIncidentWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateIncidentWithAIPrompt',
  model: 'googleai/gemini-pro-vision',
  input: {schema: ValidateIncidentWithAIInputSchema},
  output: {schema: ValidateIncidentWithAIOutputSchema},
  prompt: `You are an AI assistant tasked with validating incident reports based on provided information.

  Analyze the following incident report details to determine its authenticity. Provide a confidence score (0-1) for your assessment and a brief summary of your analysis. Focus on inconsistencies or red flags in the report.

  Incident Type: {{{incidentType}}}
  Location Description: {{{locationDescription}}}
  {{#if photoDataUris}}
  Photo/Video Evidence:
  {{#each photoDataUris}}
  {{media url=this}}
  {{/each}}
  {{/if}}
  Description: {{{description}}}
  Severity Level: {{{severityLevel}}}
  Help Needed: {{#each helpNeeded}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Number of People Affected: {{{numberOfPeopleAffected}}}

  Based on the provided information, determine if the incident report is authentic. Consider the consistency of the details, the plausibility of the scenario, and any potential discrepancies.
`,
});

const validateIncidentWithAIFlow = ai.defineFlow(
  {
    name: 'validateIncidentWithAIFlow',
    inputSchema: ValidateIncidentWithAIInputSchema,
    outputSchema: ValidateIncidentWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
