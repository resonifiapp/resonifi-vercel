import * as React from "react";

// Minimal Label component (no Radix dependency)
const Label = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={
        "text-sm font-medium leading-none text-slate-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 " +
        className
      }
      {...props}
    />
  );
});
Label.displayName = "Label";

export { Label };
export default Label;
