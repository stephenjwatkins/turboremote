import { style } from "@vanilla-extract/css";

export const container = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  margin: "0 auto",
  width: "100%",
  maxWidth: 480,
  paddingLeft: 24,
  paddingRight: 24,
});

export const footer = style({
  flex: 0,
  display: "flex",
  justifyContent: "center",
  paddingBottom: 24,
});

export const content = style({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const textBox = style({
  textAlign: "center",
});

export const logoBox = style({
  display: "inline-flex",
  width: 120,
  height: "auto",
});
