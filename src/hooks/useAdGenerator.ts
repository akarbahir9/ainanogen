import { useState } from 'react';
import { createGenerationTask, createEditTask, getTaskStatus } from '../lib/kieApi';
import { CreateTaskInput, CreateEditTaskInput } from '../types';

const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLS = 20; // Poll for a maximum of 60 seconds

export function useAdGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const pollForTaskResult = (taskId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      let pollCount = 0;
      const intervalId = setInterval(async () => {
        if (pollCount >= MAX_POLLS) {
          clearInterval(intervalId);
          reject('Image processing timed out. Please try again.');
          return;
        }

        try {
          const statusResponse = await getTaskStatus(taskId);
          if (statusResponse.state === 'success') {
            clearInterval(intervalId);
            const result = JSON.parse(statusResponse.resultJson);
            if (result.resultUrls && result.resultUrls.length > 0) {
              resolve(result.resultUrls[0]);
            } else {
              reject('Processing succeeded but no image URL was found.');
            }
          } else if (statusResponse.state === 'fail') {
            clearInterval(intervalId);
            reject(statusResponse.failMsg || 'Image processing failed.');
          }
          // If 'waiting', do nothing and let the polling continue.
        } catch (pollErr) {
          clearInterval(intervalId);
          reject('Failed to get task status.');
        }

        pollCount++;
      }, POLLING_INTERVAL);
    });
  };

  const generateAd = (input: Omit<CreateTaskInput, 'model'>): Promise<{ success: true }> => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    return new Promise(async (resolvePromise, rejectPromise) => {
      try {
        const taskData = await createGenerationTask(input);
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
