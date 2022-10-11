import { useRef, useState } from "react";
import classNames from "classnames";
import { CopyIcon } from "../icons/Copy";
import {
  button,
  clickToCopy,
  clickToCopyCopied,
} from "../styles/CopyButton.css";

export const CopyButton = () => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [copyState, setCopyState] = useState("initial");
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText("npx turboremote link");
        setCopyState("copied");
        timeoutRef.current = setTimeout(() => {
          setCopyState("initial");
        }, 3500);
      }}
      className={button}
      onPointerLeave={() => {
        setCopyState("initial");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }}
    >
      <span>npx turboremote link</span>
      <CopyIcon />
      <div
        className={classNames(clickToCopy, {
          [clickToCopyCopied]: copyState === "copied",
        })}
      >
        Copied to clipboard
      </div>
    </button>
  );
};
