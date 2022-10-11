import { createApi as createApiFromRequest } from "@turboremote/request";

export const createApi = () => {
  return createApiFromRequest({
    fetch: global.fetch,
    apiUrl: process.env.NEXT_PUBLIC_API_URL as string,
  });
};
