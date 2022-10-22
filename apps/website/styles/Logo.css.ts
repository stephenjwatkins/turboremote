import { style } from "@vanilla-extract/css";

export const svg = style({
  display: "block",
  width: "100%",
  height: "auto",
});

export const primary = style({
  fill: "#BF404A",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#C6535C",
    },
  },
});

export const gradient1 = style({
  fill: "#862D34",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#D27981",
    },
  },
});

export const gradient2 = style({
  fill: "#4D191E",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#E5B3B7",
    },
  },
});

export const secondary = style({
  fill: "#130607",
  "@media": {
    "(prefers-color-scheme: dark)": {
      fill: "#FCF7F8",
    },
  },
});
