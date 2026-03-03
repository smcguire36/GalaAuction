import { useRef, type ReactNode } from "react";
import { ModalContext } from "./ModalContext";

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => modalRef.current?.showModal();
  const closeModal = () => modalRef.current?.close();

  return (
    <ModalContext value={{ openModal, closeModal, modalRef }}>
      {children}
    </ModalContext>
  );
}

export default ModalProvider;