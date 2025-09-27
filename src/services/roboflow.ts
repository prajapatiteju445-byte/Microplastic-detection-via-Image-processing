'use server';
import axios from 'axios';
import { z } from 'zod';

const ROBOFLOW_API_URL = "https://serverless.roboflow.com";
const ROBOFLOW_WORKSPACE_ID = "research-new-things-m0fiq";
const ROBOFLOW_WORKFLOW_ID = "detect-count-and-visualize";


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
  result: z.array(z.object({
    predictions: z.array(RoboflowPredictionSchema),
    image: z.object({
      width: z.number(),
      height: z.number(),
    }),
  }))
});

export type RoboflowWorkflowResponse = z.infer<typeof RoboflowResponseSchema>;


/**
 * Calls the Roboflow API to detect microplastic particles in an image.
 * @param imageAsDataUri The image to analyze, as a data URI.
 * @returns The detection results from the Roboflow API.
 */
export async function detectParticles(imageAsDataUri: string): Promise<{ predictions: RoboflowPrediction[], image: { width: number, height: number } }> {
    const apiKey = process.env.ROBOFLOW_API_KEY;

    if (!apiKey) {
        throw new Error("The Roboflow API key is not configured in the environment variables. Please add it to continue.");
    }
    
    const url = `${ROBOFLOW_API_URL}/workspace/${ROBOFLOW_WORKSPACE_ID}/workflows/${ROBOFLOW_WORKFLOW_ID}`;

    try {
        const response = await axios.post(url, {
            "api_key": apiKey,
            "image": {
              "type": "base64",
              "value": imageAsDataUri.split(',')[1]
            }
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        // Validate the response with Zod
        const validationResult = RoboflowResponseSchema.safeParse(response.data);

        if (!validationResult.success) {
            console.error("Roboflow API response validation failed:", validationResult.error.flatten());
            throw new Error("Received an invalid response structure from the Roboflow API. Unable to process detections.");
        }
        
        // The workflow returns an array of results; we assume we want the first one.
        const firstResult = validationResult.data.result[0];

        if (!firstResult) {
            throw new Error("Roboflow workflow did not return any results.");
        }

        return firstResult;

    } catch (error) {
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
        console.error("An unexpected error occurred during Roboflow API call:", error);
        throw new Error(`An unexpected error occurred while trying to connect to Roboflow. Please check the console for details.`);
    }
}
