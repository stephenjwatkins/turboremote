import { style, globalStyle } from "@vanilla-extract/css";

export const pageContainer = style({
  paddingTop: 144,
  paddingBottom: 144,
  textAlign: "center",
  width: "100%",
});

export const container = style({
  width: "100%",
  maxWidth: 638 + 48,
  paddingLeft: 24,
  paddingRight: 24,
  margin: "auto",
});

export const oddSection = style({
  width: "100%",
  paddingTop: 72,
  paddingBottom: 72,
  background: "#f1f1f1",
  "@media": {
    "(prefers-color-scheme: dark)": {
      background: "#292929",
    },
  },
});

export const evenSection = style({
  width: "100%",
  paddingTop: 72,
  paddingBottom: 72,
  background: "#fff",
  "@media": {
    "(prefers-color-scheme: dark)": {
      background: "#000",
    },
  },
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

export const question = style({});

export const questionQuestion = style({
  fontSize: 16,
  fontWeight: "600",
});
export const questionAnswer = style({
  fontSize: 16,
  lineHeight: "150%",
});

globalStyle(`${question} code`, {
  fontSize: 16,
  paddingLeft: 8,
  paddingRight: 8,
  marginLeft: 8,
  marginRight: 8,
  borderRadius: 99,
  background: "#eee",
  "@media": {
    "(prefers-color-scheme: dark)": {
      background: "#000",
    },
  },
});
