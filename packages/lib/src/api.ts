import type { RequestInit, Response } from "node-fetch";

export type ApiConfig = {
  fetch: any;
  apiUrl: string;
};

export class ApiError extends Error {
  code: number;
  text: string;
  json?: object;
  constructor(response: Response) {
    super("Error occurred making API request");
    this.name = "ApiError";
    this.code = response.status;
    this.text = response.statusText;
    this.json = undefined;
    try {
      this.json = JSON.parse(response.statusText);
    } catch {}
  }
}

export function createApi({ fetch, apiUrl }: ApiConfig): ApiConfig {
  return { fetch, apiUrl };
}

export async function makeApiRequest(
  api: ApiConfig,
  path: string,
  init: RequestInit = {}
) {
  const { fetch, apiUrl } = api;
  const { headers = {} } = init;
  const response = await fetch(apiUrl + path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new ApiError(response);
  }
  return await response.json();
}
