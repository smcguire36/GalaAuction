import {
  GUESTFORMDEFAULTS,
  type GuestFormData,
} from "../../types/GuestFormData";
import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { FloatingInput } from "../common/FloatingInput";

export type EditGuestFormHandle = {
  submit: () => void;
};

type EditGuestFormProps = {
  ref: Ref<EditGuestFormHandle>;
  onSubmit: (data: GuestFormData) => void;
  guestId?: number;
  data: GuestFormData;
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
}) => {
  // State to track whether each field has been touched or not for validation styling purposes
  const [touched, setTouched] = useState(TouchedDefaultState);
  // State to track the validity of each field for validation styling purposes
  const [valid, setValid] = useState(ValidDefaultState);
  const formRef = useRef<HTMLFormElement>(null);
  // Setup state for the checkboxes as other fields in the form depend on their values
  const [onlineBidderOnly, setOnlineBidderOnly] = useState(
    data.onlineBidderOnly,
  );
  const [inPersonAutoGen, setInPersonAutoGen] = useState(data.inPersonAutoGen);
  const [onlineAutoGen, setOnlineAutoGen] = useState(data.onlineAutoGen);

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
    const { name } = e.target;
    console.log(name, e.target.checkValidity());
    setValid((prev) => ({ ...prev, [name]: e.target.checkValidity() }));
  };

  /**
   * Handles the change event for the Online Bidder Only checkbox.
   * @param e The change event object.
   */
  const handleOnlineBidderOnlyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = e.target.checked;
    setOnlineBidderOnly(isChecked);
    // If Online Bidder Only is checked, we should disable and clear the in-person bidder number
    if (isChecked) {
      setInPersonAutoGen(false);
      setValid((prev) => ({ ...prev, inPersonBidderNumber: true }));
    }
  };

  /**
   * Handles the change event for the Online Auto Gen checkbox.
   * @param e The change event object.
   */
  const handleOnlineAutoGenChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // Update the onlineAutoGen state based on the checkbox value
    const isChecked = e.target.checked;
    setOnlineAutoGen(isChecked);
    // Call the generic handleChange to update validity state
    handleChange(e);
  };

  /**
   * Handles the change event for the In-Person Auto Gen checkbox.
   * @param e The change event object.
   */
  const handleInPersonAutoGenChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // Update the inPersonAutoGen state based on the checkbox value
    const isChecked = e.target.checked;
    setInPersonAutoGen(isChecked);
    // If In-Person Auto Gen is checked, we should clear the in-person bidder number
    if (isChecked) {
        const input = formRef.current?.querySelector<HTMLInputElement>(
          'input[name="inPersonBidderNumber"]'
        );
        if (input) {
            console.log(input);
            input.value = "";
        }
    }

    // Call the generic handleChange to update validity state
    handleChange(e);
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
      ...Object.fromEntries(formData),
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
            defaultChecked={data.onlineBidderOnly}
            onChange={handleOnlineBidderOnlyChange}
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
          defaultValue={data.firstName}
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
          defaultValue={data.lastName}
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
          defaultValue={data.tableNumber?.toString()}
          min={1}
          max={50}
          onChange={handleChange}
          onBlur={handleOnBlur}
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
          defaultValue={data.inPersonBidderNumber?.toString()}
          min={1}
          max={999}
          onChange={handleChange}
          onBlur={handleOnBlur}
          disabled={inPersonAutoGen || onlineBidderOnly}
          hint="In-person bidder number must be a number between 1 and 999 if entered."
          touched={touched.inPersonBidderNumber}
          valid={valid.inPersonBidderNumber}
        >
          <div className="flex flex-row">
            <label className="label">
              <input
                type="checkbox"
                name="inPersonAutoGen"
                checked={inPersonAutoGen}
                disabled={onlineBidderOnly || data.inPersonBidderNumber !== null} // Disable if Online Bidder Only is checked or if there is already a bidder number since we don't want them to auto-gen and overwrite an existing number in that case
                onChange={handleInPersonAutoGenChange}
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
          defaultValue={data.onlineBidderNumber?.toString()}
          min={1000}
          max={1999}
          onChange={handleChange}
          onBlur={handleOnBlur}
          disabled={onlineAutoGen}
          hint="Online bidder number must be a number between 1000 and 1999 if entered."
          touched={touched.onlineBidderNumber}
          valid={valid.onlineBidderNumber}
        >
          <div className="flex flex-row">
            <label className="label">
              <input
                type="checkbox"
                name="onlineAutoGen"
                checked={onlineAutoGen}
                onChange={handleOnlineAutoGenChange}
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

/*
          <div
            className={`input validator ${touched.onlineBidderNumber && !valid.onlineBidderNumber ? "input-error" : ""}`}
          >
            <input
              name="onlineBidderNumber"
              type="number"
              defaultValue={data.onlineBidderNumber?.toString()}
              onChange={handleChange}
              onBlur={handleOnBlur}
              placeholder="Online Bidder #"
              className="input-bordered"
            />
            <div className="flex flex-row">
              <label className="label">
                <input
                  type="checkbox"
                  name="onlineAutoGen"
                  defaultChecked={data.onlineAutoGen}
                  onChange={handleChange}
                  className="checkbox checkbox-sm"
                />
                Auto
              </label>
            </div>
          </div>
          <div
            className={`validator-hint ${touched.onlineBidderNumber && !valid.onlineBidderNumber ? "visible text-error" : ""}`}
          >
            Online bidder number must be a valid number if entered.
          </div>

*/
