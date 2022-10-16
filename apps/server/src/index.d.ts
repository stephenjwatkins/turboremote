export type ArtifactEvent = {
  duration: number;
  hash: string;
  sessionId: string;
  event: "MISS" | "HIT";
  source: "LOCAL" | "REMOTE";
};
