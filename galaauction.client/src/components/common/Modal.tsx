import { type ReactNode, type ComponentProps, use, useEffect, useRef } from "react";
import { ModalContext } from "../../store/ModalContext";

interface ModalProps extends ComponentProps<"dialog"> {
  id: string;
  title: string;
  children: ReactNode;
}

export function Modal({ id, title, children, ...props }: ModalProps) {
  const { activeId, close } = use(ModalContext);
  const localRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = localRef.current;
    if (!dialog) return;

    // Attach native listener directly
    const handleNativeClose = () => {
      close();
    };

    dialog.addEventListener("close", handleNativeClose);
    return () => dialog.removeEventListener("close", handleNativeClose);
  }, [close]);

  useEffect(() => {
    if (activeId === id && !localRef.current?.open) {
      localRef.current?.showModal();
    }
    else if (activeId !== id && localRef.current?.open) {
      localRef.current?.close();
    }
  }, [activeId, id]);

  const handleClose = () => {
    close();
  };

  return (
    <dialog 
      ref={localRef} 
      className="modal" 
      onClose={handleClose}
      {...props}
    >
      <div className="modal-box bg-base-100 shadow-xl border border-base-300 p-4">
        <h3 className="text-lg font-bold absolute left-4 top-2">{title}</h3>
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <div className="py-8 px-0">{children}</div>
      </div>

      {/* Backdrop: Allows clicking outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
