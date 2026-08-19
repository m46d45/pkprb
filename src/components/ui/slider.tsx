import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex h-5 w-full touch-none items-center select-none",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-line">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-edu" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-4 rounded-full border border-line bg-surface shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </SliderPrimitive.Root>
  );
}

export { Slider };
