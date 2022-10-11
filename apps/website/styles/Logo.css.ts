import { style } from "@vanilla-extract/css";

export const svg = style({
  display: "block",
  width: "100%",
  height: "auto",
});

export const remotePath = style({
  fill: "#bbb",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#999",
    },
  },
});
