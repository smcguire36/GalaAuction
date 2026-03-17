import { useImperativeHandle, useRef, type Ref } from "react";
import { FloatingInput } from "./FloatingInput";
import type { EditGuestFormHandle } from "../guests/EditGuestForm";

export type UploadCsvData = {
  uploadFile: File;
};

const UploadCsvForm = ({
  label,
  ref,
  onSubmit,
}: {
  label: string;
  ref: Ref<EditGuestFormHandle>;
  onSubmit: (data: UploadCsvData) => void;
}) => {
  const formRef = useRef<HTMLFormElement>(null);

   useImperativeHandle(ref, () => ({
     submit: () => {
       console.log("in submit() handler inside UploadCsvForm");
       formRef.current?.requestSubmit();
     },
   }));
  
  const handleAction = (formData: FormData) => {
    console.log("Form submitted");
    // Handle form submission logic here
    const data = {
      uploadFile: formData.get("uploadFile") as File,
    };
    onSubmit(data);
  };

  return (
    <form className="flex flex-col gap-2" ref={formRef} action={handleAction}>
      <div className="flex flex-row gap-2">
        <FloatingInput
          className="flex-1"
          type="file"
          label={label}
          name="uploadFile"
          required
          hint="File is required."
          accept=".csv" // Restrict selection to CSV files
        />
      </div>
    </form>
  );
};

export default UploadCsvForm;
