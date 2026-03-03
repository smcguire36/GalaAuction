// ModalContext.tsx
import { createContext } from "react";

export const ModalContext = createContext<{
  openModal: () => void;
  closeModal: () => void;
  modalRef: React.RefObject<HTMLDialogElement | null>;
} | null>(null);
