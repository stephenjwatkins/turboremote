import { recipe } from "@vanilla-extract/recipes";

export const text = recipe({
  variants: {
    size: {
      title: { fontSize: 42, lineHeight: 1.4 },
      headline: { fontSize: 18, lineHeight: 1.4 },
      body: { fontSize: 14, lineHeight: 1.4, color: "#888" },
    },
  },
});
