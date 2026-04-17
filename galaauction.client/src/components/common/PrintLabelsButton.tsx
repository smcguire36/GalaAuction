import Button from "./Button";
import PrintIcon from "./icons/PrintIcon";

const PrintLabelsButton = ({
  label = "PRINT LABELS",
  onClick,
  disabled,
}: {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button label={label} onClick={onClick} disabled={disabled}>
      <PrintIcon />
    </Button>    
  );
};

export default PrintLabelsButton;
