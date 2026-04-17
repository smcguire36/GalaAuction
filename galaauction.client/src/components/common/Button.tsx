const Button = ({
  type = "button",
  label="",
  onClick,
  disabled=false,
  className = "",
  children,
}: {
  type?: "button" | "submit" | "reset";
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <button
      type={type}
      className={`btn btn-outline ${disabled ? "btn-disabled" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
      {children}
    </button>
  );
};

export default Button;
