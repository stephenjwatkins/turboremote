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

export const RESERVED_TOKEN_NAMES = ["Turboremote CLI"];
export function isValidTokenName(name: string) {
  return name.length > 0 && !RESERVED_TOKEN_NAMES.includes(name);
}
