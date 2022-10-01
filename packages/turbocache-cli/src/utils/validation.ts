export function isValidEmail(email: string) {
  return (
    email.length > 5 &&
    email.indexOf("@") > 0 &&
    email.indexOf(".") > email.indexOf("@")
  );
}

export function isValidTeamName(name: string) {
  return name.length > 0;
}

export function isValidTokenName(name: string) {
  return name.length > 0 && name !== "Turboremote CLI";
}
