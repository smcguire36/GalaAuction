import {
  type ReactNode,
  type ComponentProps,
  use,
  useEffect,
  useRef,
} from "react";
import { ModalContext } from "../../store/ModalContext";

export type ModalHandle = {
  open: () => void;
};

interface ModalProps extends ComponentProps<"dialog"> {
  id: string;
  title: string;
  customVariant: "close" | "confirm";
  onConfirm?: () => void;
  onCancel?: () => void;
  children: ReactNode;
}

export function Modal({
  id,
  title,
  customVariant = "close",
  onConfirm,
  children,
  ...props
}: ModalProps) {
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
    } else if (activeId !== id && localRef.current?.open) {
      localRef.current?.close();
    }
  }, [activeId, id]);

  const handleClose = () => {
    close();
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (onConfirm) onConfirm();
  };

  return (
    <dialog ref={localRef} className="modal" onClose={handleClose} {...props}>
      <div className="modal-box bg-base-100 shadow-xl border border-base-300 p-4">
        <h3 className="text-lg font-bold absolute left-4 top-2">{title}</h3>
        {customVariant === "close" && (
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
        )}
        <div className="pt-8 px-0">{children}</div>
        <div className="modal-action mt-2">
          {/* if there is a button in form, it will close the modal */}
          {customVariant === "close" && (
            <form
              method="dialog"
              className="flex gap-2"
            >
              <button className="btn btn-ghost">
                CLOSE
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </form>
          )}
          {customVariant === "confirm" && (
            <>
              <form method="dialog" className="flex gap-2">
                <button className="btn btn-ghost">
                  CANCEL
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </form>
              <form
                method="dialog"
                className="flex gap-2"
                onSubmit={handleSubmit}
              >
                <button type="submit" className="btn btn-accent">
                  CONFIRM
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Backdrop: Allows clicking outside to close */}
      {customVariant === "close" && (
        <form method="dialog" className="modal-backdrop">
          <button>CLOSE</button>
        </form>
      )}
    </dialog>
  );
}
