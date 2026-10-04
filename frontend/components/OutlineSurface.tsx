import { Surface } from "@heroui/react";
import clsx from "clsx";
import { ComponentProps } from "react";

interface OutlineSurfaceProps extends ComponentProps<typeof Surface> {}

export function OutlineSurface({
  className,
  children,
  ...props
}: OutlineSurfaceProps) {
  return (
    <Surface
      className={clsx(
        "p-3.5 rounded-xl border border-default-200 shadow-none",
        className,
      )}
      variant="transparent"
      {...props}
    >
      {children}
    </Surface>
  );
}
