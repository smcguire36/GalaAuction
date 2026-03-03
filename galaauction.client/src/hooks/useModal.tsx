import { use } from "react";
import { ModalContext } from "../store/ModalContext";

// Custom hook to use the modal anywhere
export const useModal = () => {
  const context = use(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};
