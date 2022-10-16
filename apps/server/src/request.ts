export function parseRequest(request: any) {
  const { teamId: teamIdFromConfig, slug: teamIdFromCommand } =
    request.query as { teamId: string; slug?: string };
  const { authorization } = request.headers;
  const [, token] = authorization.split(" ");
  const teamId = teamIdFromCommand || teamIdFromConfig;
  return { teamId, token };
}

function parseArtifactRequest(request: any) {
  const { artifactId } = request.params as { artifactId: string };
  const { teamId, token } = parseRequest(request);
  return { artifactId, teamId, token };
}

export function parseFetchRequest(request: any) {
  return parseArtifactRequest(request);
}

export function parsePutRequest(request: any) {
  const {
    ["x-artifact-duration"]: duration,
    ["x-artifact-tag"]: tag,
    ["content-length"]: size,
  } = request.headers;
  return { ...parseArtifactRequest(request), duration, tag, size };
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
