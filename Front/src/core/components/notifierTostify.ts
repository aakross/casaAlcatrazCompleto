import { toast, type ToastOptions } from "react-toastify";

const toastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const notify = {
  success: (message: string) => toast.success(message, toastConfig),
  error: (message: string) => toast.error(message, toastConfig),
  warning: (message: string) => toast.warning(message, toastConfig),
  info: (message: string) => toast.info(message, toastConfig),
};
