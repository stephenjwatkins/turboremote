import { style } from "@vanilla-extract/css";

export const button = style({
  position: "relative",
  overflow: "hidden",
  display: "inline-flex",
  alignItems: "center",
  gap: 12,
  border: "none",
  background: "#eee",
  color: "#000",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 16,
  lineHeight: 1,
  cursor: "pointer",
  borderRadius: 99,
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 32,
  paddingRight: 32,
  transition: "background .2s ease-out",
  "@media": {
    "(prefers-color-scheme: dark)": {
      background: "#000",
      color: "#bbb",
    },
  },
  selectors: {
    "&:hover": {
      background: "#e5e5e5",
      "@media": {
        "(prefers-color-scheme: dark)": {
          background: "#111",
        },
      },
    },
  },
});

export const clickToCopy = style({
  position: "absolute",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "#e5e5e5",
  color: "#000",
  borderRadius: 99,
  opacity: 0,
  pointerEvents: "none",
  transition: "all .2s ease-out",
  "@media": {
    "(prefers-color-scheme: dark)": {
      background: "#111",
      color: "#bbb",
    },
  },
});

export const clickToCopyCopied = style({
  opacity: 0.9,
});
