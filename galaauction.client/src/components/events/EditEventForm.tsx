
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { FloatingInput } from "../common/FloatingInput";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import { parseOptionalInt } from "../../utilities/parseInteger";
import { GALAEVENTDEFAULTS, type GalaEventDto } from "../../dto/GalaEventDto";

type EditEventFormProps = {
  ref: Ref<ModalFormHandle>;
  onSubmit: (data: GalaEventDto) => void;
  eventId?: number;
  data: GalaEventDto;
  setData: React.Dispatch<React.SetStateAction<GalaEventDto>>;
};

const TouchedDefaultState = {
  eventName: false,
  eventDate: false,
  organizationName: false,
  thankYouMessage: false,
  eventStatusId: false,
  eventStatusText: false
};

const ValidDefaultState = {
  eventName: false,
  eventDate: false,
  organizationName: false,
  thankYouMessage: false,
  eventStatusId: false,
  eventStatusText: false
};

const EditEventForm: React.FC<EditEventFormProps> = ({
  ref,
  onSubmit,
  data,
  setData,
}) => {
  // State to track whether each field has been touched or not for validation styling purposes
  const [touched, setTouched] = useState(TouchedDefaultState);
  // State to track the validity of each field for validation styling purposes
  const [valid, setValid] = useState(ValidDefaultState);
  const formRef = useRef<HTMLFormElement>(null);

  // When the data prop changes (e.g., when opening the modal with new event data),
  // Check the contents of the event name and event date fields and update the validity state for those fields since they are required and their validity depends on their contents
  useEffect(() => {
    // Reset valid states when new data loads
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValid((prev) => ({
      ...prev,
      eventName: data.eventName.trim() !== "",
      eventDate: data.eventDate.trim() !== "",
    })); 
  }, [data.galaEventId]); // Only reset when galaEventId changes

  useImperativeHandle(ref, () => ({
    submit: () => {
      console.log("in submit() handler inside EditEventForm");
      formRef.current?.requestSubmit();
    },
  }));

  /**
   * This is a generic change handler that updates the validity state for any input field based on its name attribute.
   * I will use this for all fields except the Online Bidder Only checkbox and the Auto Gen checkboxes since they have
   * additional logic that needs to run when they are changed.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    const nextValue =
      type === "checkbox" ? checked : type === "number" ? (value === "" ? null : Number(value)) : value;

    setData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
    setValid((prev) => ({ ...prev, [name]: e.target.checkValidity() }));
  };

  /**
   * Generic onBlur handler that updates the touched state for the input field based on its name attribute.
   * It also has logic to set touched to false if the field is not required and left blank so that validation
   * styles won't be applied in that scenario.
   * @param e The blur event object.
   */
  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (e.target.value === "" && !e.target.required) {
      setTouched((prev) => ({ ...prev, [name]: false }));
    } else {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }

    // Sample code for how to access form values when not controlled
    //    const inputs = formRef.current?.getElementsByTagName("input");
    //    console.log(inputs);
  };

  /**
   * Handles the form submission.  The Form component will call this function and pass in the FormData object
   * when the form is submitted.
   * @param formData The FormData object containing the form values.
   */
  const handleAction = (formData: FormData) => {
    // 1. Convert to a plain object and cast to GuestFormData type.
    const data: GalaEventDto = {
      ...GALAEVENTDEFAULTS,
      galaEventId: parseOptionalInt(formData.get("galaEventId")) ?? GALAEVENTDEFAULTS.galaEventId,
      eventName: formData.get("eventName") as string,
      eventDate: formData.get("eventDate") as string,
      organizationName: formData.get("organizationName") as string,
      thankYouMessage: formData.get("thankYouMessage") as string,
    };  
    console.log("In handleAction of EditEventForm", data);

    // 2. Call the onSubmit() method in the parent component and pass the form data up
    onSubmit(data);
  };

  return (
    <form className="flex flex-col gap-2" ref={formRef} action={handleAction}>
      <input type="hidden" name="galaEventId" value={data.galaEventId} />
      <div className="flex flex-row gap-2">
        <FloatingInput
          className="flex-3 min-w-0"
          type="text"
          label="Event Name"
          name="eventName"
          required
          value={data.eventName}
          onChange={handleChange}
          onBlur={handleOnBlur}
          hint="Event name is required."
          touched={touched.eventName}
          valid={valid.eventName}
        />
        <FloatingInput
          className="flex-1 min-w-32"
          type="date"
          label="Event Date"
          name="eventDate"
          inputClassName="pr-8"
          required
          value={data.eventDate}
          onChange={handleChange}
          onBlur={handleOnBlur}
          hint="Event date is required."
          touched={touched.eventDate}
          valid={valid.eventDate}
        />
      </div>
      <div className="flex flex-row">
        <FloatingInput
          className="w-full"
          type="text"
          label="Thank You Message"
          name="thankYouMessage"
          required
          value={data.thankYouMessage}
          onChange={handleChange}
          onBlur={handleOnBlur}
          hint="Thank you message is required."
          touched={touched.thankYouMessage}
          valid={valid.thankYouMessage}
        />
      </div>
      <div className="flex flex-row gap-2">
        <FloatingInput
          className="flex-3 min-w-0"
          type="text"
          label="Organization Name"
          name="organizationName"
          required
          value={data.organizationName}
          onChange={handleChange}
          onBlur={handleOnBlur}
          hint="Organization name is required."
          touched={touched.organizationName}
          valid={valid.organizationName}
        />
        <FloatingInput
          className="flex-1 min-w-32"
          type="text"
          label="Event Status"
          name="eventStatus"
          inputClassName="pr-8"
          value={data.eventStatusText ?? ""}
          hint="Event status is required."
          disabled={true}
        />
      </div>  
    </form>
  );
};

export default EditEventForm;

