import { ReactNode } from "react";
import { text } from "../styles/Text.css";

export const Text = ({
  children,
  style,
}: {
  children: ReactNode;
  style: "headline" | "title" | "body";
}) => {
  return <span className={text({ size: style })}>{children}</span>;
};
