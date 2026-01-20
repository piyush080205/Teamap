'use server';
/**
 * @fileOverview Summarizes an incident report for quick understanding.
 *
 * - summarizeIncidentReport - A function that summarizes the incident report.
 * - SummarizeIncidentReportInput - The input type for the summarizeIncidentReport function.
 * - SummarizeIncidentReportOutput - The return type for the summarizeIncidentReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncidentReportInputSchema = z.object({
  incidentType: z.string().describe('The type of incident (e.g., accident, fire, medical).'),
  location: z.string().describe('The location of the incident.'),
  severity: z.string().describe('The severity of the incident (e.g., critical, warning, info).'),
  details: z.string().describe('Additional details about the incident.'),
});
export type SummarizeIncidentReportInput = z.infer<typeof SummarizeIncidentReportInputSchema>;

const SummarizeIncidentReportOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the incident details.'),
});
export type SummarizeIncidentReportOutput = z.infer<typeof SummarizeIncidentReportOutputSchema>;

export async function summarizeIncidentReport(input: SummarizeIncidentReportInput): Promise<SummarizeIncidentReportOutput> {
  return summarizeIncidentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIncidentReportPrompt',
  input: {schema: SummarizeIncidentReportInputSchema},
  output: {schema: SummarizeIncidentReportOutputSchema},
  prompt: `Summarize the following incident report in a concise manner for quick understanding, even with limited network connectivity.  Focus on the most critical information.

Incident Type: {{{incidentType}}}
Location: {{{location}}}
Severity: {{{severity}}}
Details: {{{details}}}`,
});

const summarizeIncidentReportFlow = ai.defineFlow(
  {
    name: 'summarizeIncidentReportFlow',
    inputSchema: SummarizeIncidentReportInputSchema,
    outputSchema: SummarizeIncidentReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
