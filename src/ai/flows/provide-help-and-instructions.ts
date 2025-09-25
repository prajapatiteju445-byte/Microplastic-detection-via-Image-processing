'use server';
/**
 * @fileOverview This file defines a Genkit flow to provide help and instructions regarding microplastic detection, image processing, and data export options.
 *
 * - provideHelpAndInstructions - A function that returns help and instructions for the application.
 * - ProvideHelpAndInstructionsOutput - The return type for the provideHelpAndInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideHelpAndInstructionsOutputSchema = z.object({
  helpText: z.string().describe('Help and instructions regarding microplastic detection, image processing, and data export options.'),
});

export type ProvideHelpAndInstructionsOutput = z.infer<typeof ProvideHelpAndInstructionsOutputSchema>;

export async function provideHelpAndInstructions(): Promise<ProvideHelpAndInstructionsOutput> {
  return provideHelpAndInstructionsFlow();
}

const prompt = ai.definePrompt({
  name: 'provideHelpAndInstructionsPrompt',
  output: {schema: ProvideHelpAndInstructionsOutputSchema},
  prompt: `# 📝 Quick Guide:

## 1. Prepare Your Sample Image

* **Filter** your water sample onto a clean filter or slide.
* **Photograph** the filter using a microscope or high-magnification lens.
* **MUST be in focus** and well-lit.
* **Crucial:** Include a **scale bar** (ruler/micrometer) in the image, or know the exact field-of-view size.
* Save as **JPEG** or **PNG**.

## 2. Submit & Analyze

* Go to **"Submit a Sample"**.
* **Upload** your prepared image file.
* Fill in required details:
    * **Location** (GPS/Address).
    * **Date & Time** collected.
    * **Water Body Type** (e.g., River, Tap).
    * **Scale Information** (Enter size if no scale bar is visible).
    * **Contamination Notes** (e.g., "Used glass beakers").
* Click **"Analyze & Generate Report"**. (Wait 30-60 seconds for YOLOv8 to process).

## 3. Understand Your Report

| Section | What You See | Key Data |
| :--- | :--- | :--- |
| **Visual Analysis** | Your image with colored **YOLOv11 masks** on particles. | **Predicted Type** (Fiber, Fragment) and **Confidence Score**. |
| **Quantitative Results** | Summary of total findings. | **Total MP Count**, **Concentration**, **Particle Size Range (μm)**. |
| **Detailed Inventory** | A table of every detected particle. | **Measured Size (μm)** and **Aspect Ratio** (for shape analysis). |

## 4. Share Your Findings

* Click **"Download Data (CSV)"** for raw results.

---
**Important Note:** This model is currently in an improvement stage. As a result, there might be variations in the detection of microplastic sizes. Your feedback is valuable as we continue to refine its accuracy.
  `,
});

const provideHelpAndInstructionsFlow = ai.defineFlow({
  name: 'provideHelpAndInstructionsFlow',
  outputSchema: ProvideHelpAndInstructionsOutputSchema,
}, async () => {
  const {output} = await prompt({});
  return output!;
});
