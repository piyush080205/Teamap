/**
 * @fileoverview This file initializes the Genkit AI platform with the Google AI provider.
 *
 * It exports a configured `ai` object that can be used throughout the application
 * to interact with generative models. The default model is set here.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * The main Genkit AI instance, configured with the Google AI plugin.
 *
 * This instance is used to define flows, prompts, and tools. It's configured
 * to use the 'gemini-1.5-flash' model by default for all generation tasks.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      // The Google AI provider is initialized here.
      // API keys are typically handled by environment variables.
    }),
  ],
  // The default model to use for all `ai.generate()` calls.
  model: 'googleai/gemini-1.5-flash',
});
