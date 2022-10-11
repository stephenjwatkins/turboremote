export function getLongest(strings: string[]) {
  let longest = 0;
  strings.forEach((s) => {
    longest = Math.max(s.length, longest);
  });
  return longest;
}
