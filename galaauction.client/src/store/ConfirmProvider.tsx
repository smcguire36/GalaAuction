// ConfirmContext.tsx
import { createContext, useContext, useState, useRef, type ReactNode } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = ({ title, message }: ConfirmOptions): Promise<boolean> => {
    setState({ isOpen: true, title, message });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleClose = (value: boolean) => {
    setState((prev) => ({ ...prev, isOpen: false }));
    resolveRef.current?.(value);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* The ONE and only dialog instance */}
      {state.isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{state.title}</h3>
            <p className="py-4">{state.message}</p>
            <div className="modal-action">
              <button className="btn" onClick={() => handleClose(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleClose(true)}>Confirm</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => handleClose(false)}>
            <button className="cursor-default">close</button>
          </div>
        </dialog>
      )}
    </ConfirmContext.Provider>
  );
}

// Custom hook for easy access
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within a ConfirmProvider");
  return context.confirm;
};
