import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ 
  className, 
  value = [5], 
  onValueChange, 
  onPointerDown,
  onPointerUp,
  min = 0, 
  max = 10, 
  step = 1,
  ...props 
}, ref) => {
  const inputRef = React.useRef(null);
  
  React.useImperativeHandle(ref, () => inputRef.current);
  
  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  return (
    <input
      ref={inputRef}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={cn(
        "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md",
        "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md",
        "[&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-[#2DD4BF] [&::-webkit-slider-runnable-track]:to-gray-700",
        className
      )}
      style={{
        background: `linear-gradient(to right, #2DD4BF 0%, #2DD4BF ${((value[0] - min) / (max - min)) * 100}%, #374151 ${((value[0] - min) / (max - min)) * 100}%, #374151 100%)`
      }}
      {...props}
    />
  );
});

Slider.displayName = "Slider";

export { Slider };