import Button from "./Button";
import CheckoutIcon from "./icons/CheckoutIcon";

const CheckoutActionButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <CheckoutIcon />
    </Button>
  );
};

export default CheckoutActionButton;
