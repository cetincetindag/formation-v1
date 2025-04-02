import React from "react";
import { cn } from "~/lib/utils";
interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="range"
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Slider.displayName = "Slider";
export { Slider };
