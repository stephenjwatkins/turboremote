import base64 from "uuid-base64";

export function uuidToBase64(uuid: string) {
  return base64.encode(uuid);
}

export function base64ToUuid(base64Id: string) {
  return base64.decode(base64Id);
}

export function isUuid(uuid: string) {
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(uuid);
}

export function normalizeUuid(uuidOrBase64: string) {
  if (isUuid(uuidOrBase64)) {
    return uuidOrBase64;
  }
  return base64ToUuid(uuidOrBase64);
}

export function mapObjectsWithHashToBase64(fields = ["hash"]) {
  return (object: any) => {
    return fields.reduce((acc, key) => {
      return { ...acc, [key]: uuidToBase64(object[key]) };
    }, object);
  };
}

export function mapObjectWithHashToBase64(object: any, fields = ["hash"]) {
  return fields.reduce((acc, key) => {
    return { ...acc, [key]: uuidToBase64(object[key]) };
  }, object);
}
