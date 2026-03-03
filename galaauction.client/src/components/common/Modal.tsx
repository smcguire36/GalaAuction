import { type ReactNode, type ComponentProps } from "react";

interface ModalProps extends ComponentProps<"dialog"> {
  title: string;
  children: ReactNode;
  onClose: () => void;
  // Note: 'ref' is just a normal prop in React 19!
  ref: React.RefObject<HTMLDialogElement | null>;
}

export function Modal({ title, children, onClose, ref, ...props }: ModalProps) {
  return (
    <dialog 
      ref={ref} 
      className="modal" 
      onClose={(e) => {
        e.stopPropagation();
        onClose();
      }}
      {...props}
    >
      <div className="modal-box bg-base-100 shadow-xl border border-base-300 p-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="py-4">{children}</div>
        
        <div className="modal-action">
          {/* Method "dialog" button inside a form closes the modal natively */}
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>

      {/* Backdrop: Allows clicking outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
