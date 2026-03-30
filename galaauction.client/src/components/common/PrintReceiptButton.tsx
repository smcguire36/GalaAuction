import Button from "./Button";
import PrintIcon from "./icons/PrintIcon";

const PrintReceiptButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <PrintIcon />
    </Button>
  );
};

export default PrintReceiptButton;
