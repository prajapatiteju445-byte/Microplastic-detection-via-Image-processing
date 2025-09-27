'use server';
import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const ai = {
  defineFlow: genkit.defineFlow,
  definePrompt: genkit.definePrompt,
  defineTool: genkit.defineTool,
  embed: genkit.embed,
  generate: genkit.generate,
  stream: genkit.stream,
  model: genkit.model,
  prompt: genkit.prompt,
};
