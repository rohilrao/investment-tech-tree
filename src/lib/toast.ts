'use client';

import { toast } from 'react-toastify';

export const toastSuccess = (message: string) => {
  toast.success(message, {
    position: 'bottom-center',
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
  });
};

export const toastError = (customMessage: string, error: Error) => {
  toast.error(`${customMessage}: ${error.message}`, {
    position: 'bottom-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
  });
};
