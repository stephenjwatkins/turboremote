export function getGreeting() {
  const hourOfDay = new Date().getHours();
  if (hourOfDay < 5 || hourOfDay >= 17) {
    return "Good evening!";
  }
  if (hourOfDay >= 5 && hourOfDay < 12) {
    return "Good morning!";
  }
  if (hourOfDay >= 12 && hourOfDay < 17) {
    return "Good afternoon!";
  }
}
