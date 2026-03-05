import { useState, type ReactNode } from "react";
import { ModalContext } from "./ModalContext";

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeId, setActiveId] = useState("");

  const open = (id: string) => {
    setActiveId(id);
  };

  const close = () => {
    setActiveId("");
  };

  return (
    <ModalContext value={{ open, close, activeId }}>
      {children}
    </ModalContext>
  );
}

export default ModalProvider;