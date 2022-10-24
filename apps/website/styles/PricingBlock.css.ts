import { style } from "@vanilla-extract/css";

export const container = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const highlightRow = style({
  display: "inline-flex",
  flexDirection: "row",
  justifyContent: "center",
  gap: 36,
  "@media": {
    "(max-width: 600px)": {
      alignSelf: "center",
      flexDirection: "column",
    },
  },
});

export const highlight = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
  textAlign: "left",
});

export const highlightHeadline = style({
  fontSize: 16,
  fontWeight: "600",
});

export const highlightBody = style({
  display: "block",
});

export const highlightPrice = style({
  fontSize: 36,
  fontWeight: "400",
  color: "#C6535C",
});

export const highlightDescription = style({
  fontSize: 14,
});

export const includesText = style({
  fontWeight: "600",
});

export const includesPointsBox = style({});

export const includesPoints = style({
  listStyleType: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 36,
  "@media": {
    "(max-width: 600px)": {
      gap: 12,
    },
  },
});

export const includesPoint = style({});
