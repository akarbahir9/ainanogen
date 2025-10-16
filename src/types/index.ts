export interface CreateTaskInput {
  model: 'google/nano-banana';
  prompt: string;
  output_format?: 'png' | 'jpeg';
  image_size?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9' | 'auto';
}

export interface CreateEditTaskInput {
  model: 'google/nano-banana-edit';
  prompt: string;
  image_urls: string[];
  output_format?: 'png' | 'jpeg';
  image_size?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9' | 'auto';
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'success' | 'fail';
    param: string;
    resultJson: string; // JSON string e.g., '{"resultUrls":["url"]}'
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}
