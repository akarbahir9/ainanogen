import { useState } from 'react';
import { createGenerationTask, createEditTask, getTaskStatus } from '../lib/kieApi';
import { uploadFile } from '../lib/fileUploader';
import { CreateTaskInput, CreateEditTaskInput } from '../types';

const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLS = 20; // Poll for a maximum of 60 seconds

interface GenerateAdInput {
  prompt: string;
  image_size: string;
  output_format: string;
  files: {
    productImage: File | null;
    logo: File | null;
    packagingDesign: File | null;
  };
}

export function useAdGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const pollForTaskResult = (taskId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      let pollCount = 0;

      const poll = async () => {
        if (pollCount >= MAX_POLLS) {
          reject('Image processing timed out. Please try again.');
          return;
        }

        try {
          const statusResponse = await getTaskStatus(taskId);
          if (statusResponse.state === 'success') {
            const result = JSON.parse(statusResponse.resultJson);
            if (result.resultUrls && result.resultUrls.length > 0) {
              resolve(result.resultUrls[0]);
            } else {
              reject('Processing succeeded but no image URL was found.');
            }
          } else if (statusResponse.state === 'fail') {
            reject(statusResponse.failMsg || 'Image processing failed.');
          } else {
            // If still waiting, poll again after the interval
            pollCount++;
            setTimeout(poll, POLLING_INTERVAL);
          }
        } catch (pollErr) {
          reject('Failed to get task status.');
        }
      };

      // Start the first poll
      poll();
    });
  };

  const generateAd = ({ prompt, image_size, output_format, files }: GenerateAdInput): Promise<{ success: true }> => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    return new Promise(async (resolvePromise, rejectPromise) => {
      try {
        const filesToUpload = [files.productImage, files.logo, files.packagingDesign].filter(Boolean) as File[];
        let imageUrls: string[] = [];

        if (filesToUpload.length > 0) {
          imageUrls = await Promise.all(filesToUpload.map(file => uploadFile(file)));
        }

        let taskData;
        if (imageUrls.length > 0) {
          // Use edit task if images are provided
          const editInput: Omit<CreateEditTaskInput, 'model'> = {
            prompt,
            image_urls: imageUrls,
            image_size,
            output_format,
          };
          taskData = await createEditTask(editInput);
        } else {
          // Use generation task if no images
          const generationInput: Omit<CreateTaskInput, 'model'> = {
            prompt,
            image_size,
            output_format,
          };
          taskData = await createGenerationTask(generationInput);
        }

        const newImageUrl = await pollForTaskResult(taskData.taskId);
        setImageUrl(newImageUrl);
        setIsLoading(false);
        resolvePromise({ success: true });
      } catch (err: any) {
        const errorMessage = typeof err === 'string' ? err : (err.message || 'Failed to start generation task.');
        setError(errorMessage);
        setIsLoading(false);
        rejectPromise({ success: false, error: errorMessage });
      }
    });
  };

  const editAd = (input: { editPrompt: string, imageUrl: string }): Promise<{ success: true }> => {
    setIsEditing(true);
    setError(null);

    const editInput: Omit<CreateEditTaskInput, 'model'> = {
      prompt: input.editPrompt,
      image_urls: [input.imageUrl],
    };

    return new Promise(async (resolvePromise, rejectPromise) => {
      try {
        const taskData = await createEditTask(editInput);
        const newImageUrl = await pollForTaskResult(taskData.taskId);
        setImageUrl(newImageUrl);
        setIsEditing(false);
        resolvePromise({ success: true });
      } catch (err: any) {
        const errorMessage = typeof err === 'string' ? err : (err.message || 'Failed to start edit task.');
        setError(errorMessage);
        setIsEditing(false);
        rejectPromise({ success: false, error: errorMessage });
      }
    });
  };

  return { isLoading, isEditing, error, imageUrl, generateAd, editAd };
}
