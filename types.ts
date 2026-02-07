export interface Clip {
  id: string;
  content: string;
  note?: string;
  created_at: number;
}

export type Theme = 'light' | 'dark';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}