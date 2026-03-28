import {
  GUESTFORMDEFAULTS,
  type GuestFormData,
} from "../../types/GuestFormData";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { FloatingInput } from "../common/FloatingInput";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import { parseOptionalInt } from "../../utilities/parseInteger";

type EditGuestFormProps = {
  ref: Ref<ModalFormHandle>;
  onSubmit: (data: GuestFormData) => void;
  guestId?: number;
  data: GuestFormData;
  setData: React.Dispatch<React.SetStateAction<GuestFormData>>;
};

const TouchedDefaultState = {
  firstName: false,
  lastName: false,
  tableNumber: false,
  inPersonBidderNumber: false,
  onlineBidderNumber: false,
  inPersonAutoGen: false,
  onlineAutoGen: false,
};

const ValidDefaultState = {
  firstName: false,
  lastName: false,
  tableNumber: true, // Non-required, blank is valid
  inPersonBidderNumber: true, // Non-required, blank is valid
  onlineBidderNumber: true, // Non-required, blank is valid
  inPersonAutoGen: true,
  onlineAutoGen: true,
};

const EditGuestForm: React.FC<EditGuestFormProps> = ({
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

  // When the data prop changes (e.g., when opening the modal with new guest data),
  // Check the contents of the first and last name fields and update the validity state for those fields since they are required and their validity depends on their contents
  useEffect(() => {
    // Reset valid states when new data loads
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValid((prev) => ({
      ...prev,
      firstName: data.firstName.trim() !== "",
      lastName: data.lastName.trim() !== "",
    })); 
  }, [data.guestId]); // Only reset when guestId changes

  useImperativeHandle(ref, () => ({
    submit: () => {
      console.log("in submit() handler inside EditGuestForm");
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

  const handleOnlineBidderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    console.log("in handleOnlineBidderChange, checked:", checked);
    console.log("data before change:", data.inPersonBidderNumber);
    setData((prev) => ({
      ...prev,
      onlineBidderOnly: checked,
      // If Online Bidder Only is checked, then we need to disable and uncheck the In-Person Auto Gen checkbox and clear the In-Person Bidder Number since those options don't make sense for online-only bidders
      inPersonAutoGen: checked ? false : (prev.inPersonBidderNumber === null) ? true : false,
    }));
    setValid((prev) => ({ ...prev, [name]: true })); // Online Bidder Only is always valid since it's not required
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
    const data: GuestFormData = {
      ...GUESTFORMDEFAULTS,
//      ...Object.fromEntries(formData),
      guestId: parseOptionalInt(formData.get("guestId")) ?? GUESTFORMDEFAULTS.guestId,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      tableNumber: parseOptionalInt(formData.get("tableNumber")),
      inPersonBidderNumber: parseOptionalInt(formData.get("inPersonBidderNumber")),
      onlineBidderNumber: parseOptionalInt(formData.get("onlineBidderNumber")),
      // The checkboxes are a special case since unchecked checkboxes won't be included in the FormData,
      // so we need to determine their values based on whether they are present in the FormData or not.
      onlineBidderOnly: formData.has("onlineBidderOnly"),
      inPersonAutoGen: formData.has("inPersonAutoGen"),
      onlineAutoGen: formData.has("onlineAutoGen"),
    };
    console.log("In handleAction of EditGuestForm", data);

    // 2. Call the onSubmit() method in the parent component and pass the form data up
    onSubmit(data);
  };

  return (
    <form className="flex flex-col gap-2" ref={formRef} action={handleAction}>
      <input type="hidden" name="guestId" value={data.guestId} />
      <div className="flex flex-row-reverse">
        <label className="label">
          <input
            type="checkbox"
            name="onlineBidderOnly"
            checked={data.onlineBidderOnly}
            disabled={data.inPersonBidderNumber !== null} // Disable if there is already an in-person bidder number since it doesn't make sense to have both an in-person bidder number and be an online-only bidder
            onChange={handleOnlineBidderChange}
            className="checkbox checkbox-sm"
          />
          Online Bidder Only
        </label>
      </div>
      <div className="flex flex-row gap-2">
        <FloatingInput
          className="flex-1"
          type="text"
          label="First Name"
          name="firstName"
          required
          value={data.firstName}
          onChange={handleChange}
          onBlur={handleOnBlur}
          hint="First name is required."
          touched={touched.firstName}
          valid={valid.firstName}
        />
        <FloatingInput
          className="flex-1"
          type="text"
          label="Last Name"
          name="lastName"
          required
          value={data.lastName}
          onChange={handleChange}
          onBlur={handleOnBlur}
          hint="Last name is required."
          touched={touched.lastName}
          valid={valid.lastName}
        />
      </div>
      <div className="flex flex-row gap-2">
        <FloatingInput
          className="flex-1"
          type="number"
          label="Table #"
          name="tableNumber"
          value={data.tableNumber?.toString() ?? ""}
          min={1}
          max={50}
          onChange={handleChange}
          onBlur={handleOnBlur}
          disabled={data.onlineBidderOnly} // Disable table number input if Online Bidder Only is checked since table number doesn't make sense for online-only bidders
          hint="Table number must be a number between 1 and 50 if entered."
          touched={touched.tableNumber}
          valid={valid.tableNumber}
        />
        <div className="flex-1"></div>
      </div>
      <div className="flex flex-row gap-2">
        <FloatingInput
          className="flex-1"
          type="number"
          label="Bidder #"
          name="inPersonBidderNumber"
          value={data.inPersonBidderNumber?.toString() ?? ""}
          min={1}
          max={999}
          onChange={handleChange}
          onBlur={handleOnBlur}
          disabled={data.inPersonAutoGen || data.onlineBidderOnly}
          hint="In-person bidder number must be a number between 1 and 999 if entered."
          touched={touched.inPersonBidderNumber}
          valid={valid.inPersonBidderNumber}
        >
          <div className="flex flex-row">
            <label className="label">
              <input
                type="checkbox"
                name="inPersonAutoGen"
                value={1}
                checked={data.inPersonAutoGen}
                disabled={data.onlineBidderOnly || data.inPersonBidderNumber != null} // Disable if Online Bidder Only is checked or if there is already a bidder number since we don't want them to auto-gen and overwrite an existing number in that case
                onChange={handleChange}
                className="checkbox checkbox-sm"
              />
              Auto
            </label>
          </div>
        </FloatingInput>
        <FloatingInput
          className="flex-1"
          type="number"
          label="Online Bidder #"
          name="onlineBidderNumber"
          value={data.onlineBidderNumber?.toString() ?? ""}
          min={1000}
          max={1999}
          onChange={handleChange}
          onBlur={handleOnBlur}
          disabled={data.onlineAutoGen}
          hint="Online bidder number must be a number between 1000 and 1999 if entered."
          touched={touched.onlineBidderNumber}
          valid={valid.onlineBidderNumber}
        >
          <div className="flex flex-row">
            <label className="label">
              <input
                type="checkbox"
                name="onlineAutoGen"
                value={1}
                checked={data.onlineAutoGen}
                disabled={data.onlineBidderNumber != null} // Disable if there is already a bidder number since we don't want them to auto-gen and overwrite an existing number in that case
                onChange={handleChange}
                className="checkbox checkbox-sm"
              />
              Auto
            </label>
          </div>
        </FloatingInput>
      </div>
    </form>
  );
};

export default EditGuestForm;

