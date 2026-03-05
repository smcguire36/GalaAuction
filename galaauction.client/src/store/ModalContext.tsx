// ModalContext.tsx
import { createContext } from "react";

export const ModalContext = createContext<{
  open: (id: string) => void;
  close: () => void;
  activeId: string;
}>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  open: (_id: string) => {},
  close: () => {},
  activeId: ""
});
