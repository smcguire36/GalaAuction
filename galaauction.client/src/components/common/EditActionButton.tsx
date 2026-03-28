import Button from "./Button";
import EditIcon from "./icons/EditIcon";

const EditActionButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <EditIcon />
    </Button>    
  );
};

export default EditActionButton;
