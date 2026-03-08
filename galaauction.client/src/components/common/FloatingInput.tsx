export const FloatingInput = ({
  label,
  name,
  children,
  hint,
  touched = false,
  valid = true,
  className = "",
  inputClassName = "",
  ...props
}: {
  label: string;
  name: string;
  children?: React.ReactNode;
  hint?: string;
  touched?: boolean;
  valid?: boolean;
  className?: string;
  inputClassName?: string;
} & React.ComponentProps<"input">) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className={`relative flex flex-row input ${hint ? "validator" : ""} ${touched && !valid ? "input-error" : ""}`}
      >
        <input
          {...props}
          name={name}
          placeholder=" " /* Required for peer-placeholder-shown to work */
          className={`peer input-bordered w-full placeholder-transparent focus:outline-offset-0 ${inputClassName}`}
        />
        <label
          htmlFor={name}
          className="absolute left-4 px-1 transition-all bg-base-100 text-base-content/50 pointer-events-none
                /* Resting (Inside) State: Perfect Vertical Center */
                top-1/2 -translate-y-1/2 text-base 
                
                /* Active (Top Border) State: Move up and remove centering */
                peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary
                
                /* Stay Up if there is text already */
                peer-[:not(:placeholder-shown)]:-top-2.5 
                peer-[:not(:placeholder-shown)]:translate-y-0 
                peer-[:not(:placeholder-shown)]:text-xs
                
                /* For background to stay consistent when autofill is active in Chrome */
                autofill:shadow-[inset_0_0_0px_1000px_var(--color-base-100)]"
        >
          {label}
        </label>
        {children}
      </div>
      {hint && (
        <div
          className={`validator-hint mt-0 ${touched && !valid ? "visible text-error" : ""}`}
        >
          {hint}
        </div>
      )}
    </div>
  );
};
