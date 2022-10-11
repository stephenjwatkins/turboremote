import { style } from "@vanilla-extract/css";

export const container = style({
  maxWidth: 638 + 48,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 144,
  paddingBottom: 144,
  textAlign: "center",
  margin: "auto",
});

export const logoBox = style({
  display: "inline-flex",
  maxWidth: 360,
  width: "calc(100vw - 96px)",
  height: "auto",
});

export const video = style({
  display: "inline-flex",
  maxWidth: 1276 / 2,
  width: "calc(100vw - 72px)",
  aspectRatio: "1276 / 818",
});

export const videoWhite = style({
  display: "inline-flex",
  maxWidth: 1276 / 2,
  width: "calc(100vw - 72px)",
  aspectRatio: "1276 / 818",
});

export const videoBoxBlack = style({
  position: "relative",
  display: "none",
  overflow: "hidden",
  padding: 12,
  background: "black",
  borderRadius: 10,
  boxShadow: "0 10px 25px rgba(0, 0, 0, .25)",
  "@media": {
    "(prefers-color-scheme: dark)": {
      display: "inline-flex",
    },
  },
});

export const videoBoxWhite = style({
  position: "relative",
  display: "none",
  overflow: "hidden",
  padding: 12,
  background: "white",
  borderRadius: 10,
  boxShadow: "0 10px 25px rgba(0, 0, 0, .125)",
  "@media": {
    "(prefers-color-scheme: light)": {
      display: "inline-flex",
    },
  },
});

export const videoBoxWhiteBorder = style({
  position: "absolute",
  top: 10,
  left: 10,
  right: 10,
  bottom: 10,
  border: "4px solid white",
});
