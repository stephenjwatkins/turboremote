import fetch, { RequestInit, Response } from "node-fetch";

export type InitiateLoginRequest = {
  email: string;
};

export type CheckActivationRequest = {
  activationId: number;
};

export type Account = {
  id: number;
  email: string;
  hash: string;
  created_at: string;
};

export type Team = {
  id: number;
  name: string;
  hash: string;
  created_at: string;
};

export type Token = {
  id: number;
  name: string;
  hash: string;
  teamId: number;
  teamName: string;
};

export type TeamWithToken = {
  team: Team;
  token: Token;
};

export class ApiError extends Error {
  code: number;
  text: string;
  constructor(response: Response) {
    super("Error occurred making request to API");
    this.name = "ApiError";
    this.code = response.status;
    this.text = response.statusText;
  }
}

export async function makeApiRequest(path: string, init: RequestInit = {}) {
  const { headers = {} } = init;
  const response = await fetch(process.env.API_HOST + path, {
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
