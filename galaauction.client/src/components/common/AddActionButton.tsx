import Button from "./Button";
import AddIcon from "./icons/AddIcon";

const AddActionButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button label={label} onClick={onClick} disabled={disabled}>
      <AddIcon />
    </Button>
  );
};

export default AddActionButton;
