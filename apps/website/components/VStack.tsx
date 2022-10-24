import { ReactNode } from "react";
import classNames from "classnames";
import { container } from "../styles/VStack.css";

export const VStack = ({
  children,
  gap,
  alignItems = "stretch",
  className,
  style,
}: {
  children: ReactNode;
  gap: number;
  alignItems?: "stretch" | "flex-start" | "center" | "flex-end";
  className?: string;
  style?: {};
}) => {
  return (
    <div
      className={classNames(container, className)}
      style={{ gap, alignItems, ...style }}
    >
      {children}
    </div>
  );
};
