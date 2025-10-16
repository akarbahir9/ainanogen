import { supabase } from './supabaseClient';
import { CreateTaskInput, CreateEditTaskInput, CreateTaskResponse, TaskStatusResponse } from '../types';

// Helper to extract detailed error messages from Supabase Function errors
const getFunctionError = (error: any): string => {
  // The actual error message from the edge function is often in the context object
  if (error?.context?.error) {
    return error.context.error;
  }
  return error.message || 'An unknown error occurred with the edge function.';
};

export const createGenerationTask = async (input: Omit<CreateTaskInput, 'model'>): Promise<CreateTaskResponse['data']> => {
  const { data, error } = await supabase.functions.invoke('kie-proxy', {
    body: {
      action: 'create',
      payload: input,
    },
  });

  if (error) {
    throw new Error(getFunctionError(error));
  }
  
  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to create task via Edge Function');
  }

  return data.data;
};

export const createEditTask = async (input: Omit<CreateEditTaskInput, 'model'>): Promise<CreateTaskResponse['data']> => {
  const { data, error } = await supabase.functions.invoke('kie-proxy', {
    body: {
      action: 'edit',
      payload: input,
    },
  });

  if (error) {
    throw new Error(getFunctionError(error));
  }

  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to create edit task via Edge Function');
  }

  return data.data;
};

export const getTaskStatus = async (taskId: string): Promise<TaskStatusResponse['data']> => {
  const { data, error } = await supabase.functions.invoke('kie-proxy', {
    body: {
      action: 'status',
      payload: { taskId },
    },
  });
  
  if (error) {
    throw new Error(getFunctionError(error));
  }
  
  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to fetch task status via Edge Function');
  }

  return data.data;
};
