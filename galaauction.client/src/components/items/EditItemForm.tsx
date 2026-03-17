import { ITEMFORMDEFAULTS, type ItemFormData } from "../../types/ItemFormData";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { FloatingInput } from "../common/FloatingInput";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import FloatingSelect from "../common/FloatingSelect";
import { useHttp } from "../../hooks/useHttp";

type EditItemFormProps = {
  ref: Ref<ModalFormHandle>;
  onSubmit: (data: ItemFormData) => void;
  itemId?: number;
  data: ItemFormData;
  setData: React.Dispatch<React.SetStateAction<ItemFormData>>;
};

type InputMode = "itemNumber" | "category";

const TouchedDefaultState = {
  itemNumber: false,
  itemName: false,
  winningBidderNumber: false,
  winningBidderName: false,
  winningBidAmount: false,
  paymentMethodId: false,
  paymentMethodName: false,
  categoryId: false,
  categoryName: false,
};

const ValidDefaultState = {
  itemNumber: false,
  itemName: false,
  winningBidderNumber: true, // Not required fields can be considered valid even when blank
  winningBidderName: true,
  winningBidAmount: true,
  paymentMethodId: true,
  paymentMethodName: true,
  categoryId: false,
  categoryName: false,
};

const EditItemForm: React.FC<EditItemFormProps> = ({
  ref,
  onSubmit,
  data,
  setData,
}) => {
  const { request } = useHttp();
  // State to track whether each field has been touched or not for validation styling purposes
  const [touched, setTouched] = useState(TouchedDefaultState);
  // State to track the validity of each field for validation styling purposes
  const [valid, setValid] = useState(ValidDefaultState);
  const [inputMode, setInputMode] = useState<InputMode>("itemNumber");
  const [categoryControl, setCategoryControl] = useState({
    required: true,
    disabled: false,
  });
  const [itemNumberControl, setItemNumberControl] = useState({
    required: true,
    disabled: false,
  });
  const [categories, setCategories] = useState<
    { categoryId: number; categoryName: string }[]
  >([]);
  const formRef = useRef<HTMLFormElement>(null);
  let minItemNumber = 100;
  let maxItemNumber = 999;

  const applyInputMode = (mode: InputMode) => {
    const isItemNumberMode = mode === "itemNumber";
    setItemNumberControl({
      required: isItemNumberMode,
      disabled: !isItemNumberMode,
    });
    setCategoryControl({
      required: !isItemNumberMode,
      disabled: isItemNumberMode,
    });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await request("/api/categories", "GET");
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Calculate min and max item numbers based on category IDs to enforce that item numbers fall within the correct range 
  // for their category.  This also allows the form to adapt if categories are added or removed without needing code 
  // changes to update the valid item number ranges.
  const ids = categories.map(category => category.categoryId);
  if (ids.length > 0) {
    minItemNumber = Math.min(...ids) * 100;
    maxItemNumber = (Math.max(...ids) + 1) * 100 - 1;
  }

  // When the data prop changes (e.g., when opening the modal with new guest data),
  // Check the contents of the first and last name fields and update the validity state for those fields since they are required and their validity depends on their contents
  useEffect(() => {
    // Reset valid states when new data loads
    setValid(prev => ({
      ...prev,
      itemNumber: data.itemNumber !== null,
      itemName: data.itemName.trim() !== "",
    }));

    const nextMode: InputMode =
      data.categoryId !== null && data.itemNumber === null
        ? "category"
        : "itemNumber";
    setInputMode(nextMode);
    applyInputMode(nextMode);
  }, [data.itemId]); // Only reset when itemId changes

  useImperativeHandle(ref, () => ({
    submit: () => {
      console.log("in submit() handler inside EditItemForm");
      formRef.current?.requestSubmit();
    },
  }));

  const handleItemNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value !== "") {
      const itemNumber = Number(value);
      const category = categories.find(category => {
        return (
          itemNumber >= category.categoryId * 100 &&
          itemNumber < (category.categoryId + 1) * 100
        );
      });
      if (category) {
        setData(prev => ({
          ...prev,
          categoryId: category.categoryId,
          categoryName: category.categoryName,
        }));
      }
    }
    handleChange(e);
  };

  const handleItemNumberAutoGenChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleChange(e);
  };

  /**
   * This is a generic change handler that updates the validity state for any input field based on its name attribute.
   * I will use this for all fields except the Online Bidder Only checkbox and the Auto Gen checkboxes since they have
   * additional logic that needs to run when they are changed.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    const nextValue =
      type === "checkbox"
        ? checked
        : type === "number"
          ? value === ""
            ? null
            : Number(value)
          : value;

    setData(prev => ({
      ...prev,
      [name]: nextValue,
    }));
    setValid(prev => ({ ...prev, [name]: e.target.checkValidity() }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextValue = value === "" ? null : Number(value);

    setData(prev => ({
      ...prev,
      [name]: nextValue,
      itemNumberAutoGen: nextValue !== null ? true : prev.itemNumberAutoGen,
    }));
    setValid(prev => ({ ...prev, [name]: e.target.checkValidity() }));
  };

  const handleInputModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mode = e.target.value as InputMode;
    setInputMode(mode);
    applyInputMode(mode);

    if (mode === "category") {
      setData(prev => ({
        ...prev,
        itemNumber: null,
        itemNumberAutoGen: true,
      }));
      setTouched(prev => ({ ...prev, itemNumber: false }));
      setValid(prev => ({ ...prev, itemNumber: true }));
    }
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
      setTouched(prev => ({ ...prev, [name]: false }));
    } else {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    const { name } = e.target;
    if (e.target.value === "" && !e.target.required) {
      setTouched(prev => ({ ...prev, [name]: false }));
    } else {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  /**
   * Handles the form submission.  The Form component will call this function and pass in the FormData object
   * when the form is submitted.
   * @param formData The FormData object containing the form values.
   */
  const handleAction = (formData: FormData) => {
    const parseOptionalNumber = (
      value: FormDataEntryValue | null,
    ): number | null => {
      if (typeof value !== "string" || value.trim() === "") {
        return null;
      }

      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    };

    // 1. Convert to a plain object and cast to GuestFormData type.
    const newData: ItemFormData = {
      ...ITEMFORMDEFAULTS, // Start with default values to ensure all fields are present
      ...data, // Next add existing data to preserve any fields not included in the form
      itemId:
        parseOptionalNumber(formData.get("itemId")) ?? ITEMFORMDEFAULTS.itemId,
      itemNumber:
        parseOptionalNumber(formData.get("itemNumber")) ??
        ITEMFORMDEFAULTS.itemNumber,
      itemName: formData.get("itemName") as string,
      itemNumberAutoGen:
        formData.get("itemNumberAutoGen") === "on" ||
        formData.get("itemNumberAutoGen") === "true",
      categoryId:
        parseOptionalNumber(formData.get("categoryId")) ??
        ITEMFORMDEFAULTS.categoryId,
      categoryName: formData.get("categoryName") as string,
    };
    console.log("In handleAction of EditItemForm", newData);

    // 2. Call the onSubmit() method in the parent component and pass the form data up
    onSubmit(newData);
  };

  return (
    <form className="flex flex-col gap-2" ref={formRef} action={handleAction}>
      <input type="hidden" name="itemId" value={data.itemId} />

      <div className="flex flex-row gap-6 px-1 py-1">
        <label className="label cursor-pointer gap-2 flex-1">
          <input
            type="radio"
            name="inputMode"
            value="itemNumber"
            checked={inputMode === "itemNumber"}
            onChange={handleInputModeChange}
            className="radio radio-sm"
          />
          Enter Item Number
        </label>
        <label className="label cursor-pointer gap-2 flex-1">
          <input
            type="radio"
            name="inputMode"
            value="category"
            checked={inputMode === "category"}
            onChange={handleInputModeChange}
            className="radio radio-sm"
          />
          Select Category
        </label>
      </div>

      <div className="flex flex-row gap-2">
        <FloatingInput
          className="flex-1"
          type="number"
          label="Item #"
          name="itemNumber"
          value={data.itemNumber?.toString() ?? ""}
          min={minItemNumber}
          max={maxItemNumber}
          onChange={handleItemNumberChange}
          onBlur={handleOnBlur}
          disabled={itemNumberControl.disabled}
          required={itemNumberControl.required}
          hint="Item number must be a number between 1 and 999 if entered."
          touched={touched.itemNumber}
          valid={valid.itemNumber}
        >
          <div className="flex flex-row">
            <label className="label">
              <input
                type="checkbox"
                name="itemNumberAutoGen"
                value={1}
                checked={data.itemNumberAutoGen}
                disabled={inputMode === "category"}
                onChange={handleItemNumberAutoGenChange}
                className="checkbox checkbox-sm"
              />
              Auto
            </label>
          </div>
        </FloatingInput>
        <FloatingSelect
          className="flex-1"
          label="Category"
          name="categoryId"
          value={data.categoryId?.toString() ?? ""}
          onChange={handleCategoryChange}
          onBlur={handleSelectBlur}
          required={categoryControl.required}
          disabled={categoryControl.disabled}
          hint="Category is required."
          touched={touched.categoryId}
          valid={valid.categoryId}
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.categoryName}
            </option>
          ))}
        </FloatingSelect>
      </div>
      <div>
        <FloatingInput
          className="flex-4"
          type="text"
          label="Item Name"
          name="itemName"
          required
          value={data.itemName}
          onChange={handleChange}
          onBlur={handleOnBlur}
          hint="Item name is required."
          touched={touched.itemName}
          valid={valid.itemName}
        />
      </div>
    </form>
  );
};

export default EditItemForm;
