import { toast as sonnerToast } from "sonner";

const DEFAULT_DURATION = 4000;

export const appToast = {
  success: (message: string) =>
    sonnerToast.success(message, { duration: DEFAULT_DURATION }),
  error: (message: string) =>
    sonnerToast.error(message, { duration: DEFAULT_DURATION + 1000 }),
  warning: (message: string) =>
    sonnerToast.warning(message, { duration: DEFAULT_DURATION }),
  info: (message: string) =>
    sonnerToast.info(message, { duration: DEFAULT_DURATION }),
  message: (message: string) =>
    sonnerToast.message(message, { duration: DEFAULT_DURATION }),
};
