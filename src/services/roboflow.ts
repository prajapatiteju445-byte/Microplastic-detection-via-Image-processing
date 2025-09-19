
'use server';
import axios from 'axios';
import { z } from 'zod';

const ROBOFLOW_API_URL = "https://detect.roboflow.com";
const ROBOFLOW_MODEL_ID = "microplastics-yolov5/1";

// Zod schema for a single prediction from Roboflow
const RoboflowPredictionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  confidence: z.number(),
  class: z.string(),
  class_id: z.number(),
});
export type RoboflowPrediction = z.infer<typeof RoboflowPredictionSchema>;

// Zod schema for the full Roboflow API response
const RoboflowResponseSchema = z.object({
  predictions: z.array(RoboflowPredictionSchema),
  image: z.object({
    width: z.number(),
    height: z.number(),
  }),
});
export type RoboflowResponse = z.infer<typeof RoboflowResponseSchema>;


/**
 * Calls the Roboflow API to detect microplastic particles in an image.
 * @param imageAsDataUri The image to analyze, as a data URI.
 * @returns The detection results from the Roboflow API.
 */
export async function detectParticles(imageAsDataUri: string): Promise<RoboflowResponse> {
    const apiKey = process.env.ROBOFLOW_API_KEY;

    if (!apiKey) {
        throw new Error("Roboflow API key is not configured.");
    }

    // Roboflow expects the image as a base64 string, without the data URI prefix.
    const base64Image = imageAsDataUri.split(',')[1];
    
    const url = `${ROBOFLOW_API_URL}/${ROBOFLOW_MODEL_ID}?api_key=${apiKey}&confidence=40&overlap=30`;

    try {
        const response = await axios.post(url, base64Image, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        // Validate the response with Zod
        const validationResult = RoboflowResponseSchema.safeParse(response.data);

        if (!validationResult.success) {
            console.error("Roboflow API response validation failed:", validationResult.error);
            throw new Error("Invalid response structure from Roboflow API.");
        }
        
        return validationResult.data;

    } catch (error: any) {
        console.error("Error calling Roboflow API:", error.response?.data || error.message);
        throw new Error(`Failed to get detections from Roboflow: ${error.response?.data?.message || error.message}`);
    }
}
