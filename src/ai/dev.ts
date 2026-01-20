import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-incident-report.ts';
import '@/ai/flows/validate-incident-with-ai.ts';