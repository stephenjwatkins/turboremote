function parseRequest(request: any) {
  const { artifactId } = request.params as { artifactId: string };
  const { teamId: teamIdFromConfig, slug: teamIdFromCommand } =
    request.query as { teamId: string; slug?: string };
  const { authorization } = request.headers;
  const [, token] = authorization.split(" ");
  const teamId = teamIdFromCommand || teamIdFromConfig;
  return { artifactId, teamId, token };
}

export function parseFetchRequest(request: any) {
  return parseRequest(request);
}

export function parsePutRequest(request: any) {
  const { ["x-artifact-duration"]: duration, ["x-artifact-tag"]: tag } =
    request.headers;
  return { ...parseRequest(request), duration, tag };
}

export function getAuthHeaders(token: any) {
  return { authorization: "Bearer " + token };
}

export function getMetadataHeaders({ duration, tag }: any) {
  return {
    ...(duration ? { ["x-artifact-duration"]: duration } : {}),
    ...(tag ? { ["x-artifact-tag"]: tag } : {}),
  };
}
