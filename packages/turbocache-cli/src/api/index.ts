import { sleep } from "../utils/promise";
import type {
  CheckActivationRequest,
  InitiateLoginRequest,
  Invite,
  Membership,
  Team,
  Token,
} from "./utils";
import { AccountWithToken, ApiError, makeApiRequest } from "./utils";

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
}: CheckActivationRequest): Promise<AccountWithToken | null> {
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

export async function pollLogin({ activationId }: CheckActivationRequest) {
  try {
    let accountWithToken = await checkLogin({ activationId });
    let count = 1;
    while (!accountWithToken && count < 100) {
      await sleep(3000);
      accountWithToken = await checkLogin({ activationId });
      count++;
    }
    return accountWithToken;
  } catch (error) {
    return null;
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
): Promise<Team> {
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
  { name, teamId }: { name: string; teamId: number }
): Promise<Team> {
  return await makeApiRequest("/tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, teamId }),
  });
}

export async function deleteToken(
  token: string,
  { tokenId }: { tokenId: number }
): Promise<Team> {
  return await makeApiRequest(`/tokens/${tokenId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchMemberships(token: string): Promise<Membership[]> {
  return await makeApiRequest("/memberships", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addTeamMember(
  token: string,
  { teamId, email }: { teamId: number; email: string }
): Promise<Invite> {
  return await makeApiRequest("/memberships", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ teamId, email }),
  });
}

export async function fetchTeamMemberships(
  token: string,
  { teamId }: { teamId: number }
): Promise<Membership[]> {
  return await makeApiRequest(`/team/${teamId}/memberships`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function removeTeamMember(
  token: string,
  { memberId }: { memberId: number }
) {
  return await makeApiRequest(`/memberships/${memberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
