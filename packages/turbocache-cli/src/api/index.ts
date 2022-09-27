import { ApiError, makeApiRequest } from "./utils";
import type {
  InitiateLoginRequest,
  CheckActivationRequest,
  Account,
  Team,
  Token,
  TeamWithToken,
} from "./utils";

export async function initiateLogin({
  email,
}: InitiateLoginRequest): Promise<number> {
  const { id } = await makeApiRequest("/activations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  return id;
}

export async function checkLogin({
  activationId,
}: CheckActivationRequest): Promise<Account | null> {
  try {
    return await makeApiRequest(`/activations/${activationId}`, {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchTeams(token: string): Promise<Team[]> {
  return await makeApiRequest("/teams", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createTeam(
  token: string,
  { name }: { name: string }
): Promise<TeamWithToken> {
  return await makeApiRequest("/teams", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
}

export async function fetchTokens(token: string): Promise<Token[]> {
  return await makeApiRequest("/tokens", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createToken(
  token: string,
  { name, team }: { name: string; team: number }
): Promise<Team> {
  return await makeApiRequest("/tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, team }),
  });
}
