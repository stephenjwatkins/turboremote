import { ReactNode } from "react";
import { container } from "../styles/VStack.css";

export const VStack = ({
  children,
  gap,
  alignItems = "stretch",
}: {
  children: ReactNode;
  gap: number;
  alignItems?: "stretch" | "flex-start" | "center" | "flex-end";
}) => {
  return (
    <div className={container} style={{ gap, alignItems }}>
      {children}
    </div>
  );
};
