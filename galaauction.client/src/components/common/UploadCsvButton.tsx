import Button from "./Button";
import UploadIcon from "./icons/UploadIcon";

const UploadCsvButton = ({
  label = "UPLOAD CSV",
  onClick,
  disabled,
}: {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button label={label} onClick={onClick} disabled={disabled}>
      <UploadIcon />
    </Button>    
  );
};

export default UploadCsvButton;
