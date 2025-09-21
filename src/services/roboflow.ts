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
        throw new Error("The Roboflow API key is not configured in the environment variables. Please add it to continue.");
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
            console.error("Roboflow API response validation failed:", validationResult.error.flatten());
            throw new Error("Received an invalid response structure from the Roboflow API. Unable to process detections.");
        }
        
        return validationResult.data;

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error calling Roboflow API:", error.response.data);
            const status = error.response.status;
            let userMessage = `Failed to get detections from Roboflow. The service returned an error (Status: ${status}).`;
            if (status === 401 || status === 403) {
                userMessage = "Authentication with Roboflow failed. Please check if the API key is correct and has the required permissions.";
            } else if (status >= 500) {
                userMessage = "The Roboflow service seems to be temporarily unavailable. Please try again later.";
            }
            throw new Error(userMessage);
        }
        console.error("An unexpected error occurred during Roboflow API call:", error.message);
        throw new Error(`An unexpected error occurred while trying to connect to Roboflow. Please check the console for details.`);
    }
}
