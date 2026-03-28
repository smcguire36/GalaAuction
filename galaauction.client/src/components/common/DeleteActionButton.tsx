import Button from "./Button";
import DeleteIcon from "./icons/DeleteIcon";

const DeleteActionButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <DeleteIcon />
    </Button>
  );
};

export default DeleteActionButton;
