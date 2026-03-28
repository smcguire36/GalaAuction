const Button = ({
  type = "button",
  label="",
  onClick,
  disabled=false,
  children,
}: {
  type?: "button" | "submit" | "reset";
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) => {
  return (
    <button
      type={type}
      className={`btn btn-outline ${disabled ? "btn-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
      {children}
    </button>
  );
};

export default Button;
