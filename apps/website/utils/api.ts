import { ApiConfig, makeApiRequest } from "@turboremote/request";
import { createApi as createApiFromRequest } from "@turboremote/request";

export const createApi = () => {
  return createApiFromRequest({
    fetch: global.fetch,
    apiUrl: process.env.NEXT_PUBLIC_API_URL as string,
  });
};

export const createLogin = (api: ApiConfig, { hash }: { hash: string }) => {
  return makeApiRequest(api, "/logins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hash }),
  });
};

// Ensure it is only invoked once per hash
const createCreateLoginOnce = () => {
  let invoked: { response: Promise<any>; hash: string }[] = [];
  return (api: ApiConfig, { hash }: { hash: string }) => {
    const existingInvocation = invoked.find((i) => i.hash === hash);
    if (existingInvocation) {
      return existingInvocation.response;
    }
    const response = createLogin(api, { hash });
    invoked = [...invoked, { response, hash }];
    return response;
  };
};
export const createLoginOnce = createCreateLoginOnce();
