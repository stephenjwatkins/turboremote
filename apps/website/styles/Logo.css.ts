import { style } from "@vanilla-extract/css";

export const svg = style({
  display: "block",
  width: "100%",
  height: "auto",
});

export const primary = style({
  fill: "#BF406A",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#BF406A",
    },
  },
});

export const gradient1 = style({
  fill: "#862D4A",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#D27997",
    },
  },
});

export const gradient2 = style({
  fill: "#4D192B",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#E5B3C4",
    },
  },
});

export const secondary = style({
  fill: "#260D15",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#F9ECF0",
    },
  },
});
