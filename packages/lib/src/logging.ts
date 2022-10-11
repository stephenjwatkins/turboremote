export const devTransport = {
  target: "pino-pretty",
  options: {
    translateTime: "HH:MM:ss Z",
    ignore: "pid,hostname",
  },
};

export const getLogger = () => {
  return process.env.NODE_ENV === "production"
    ? true
    : { transport: devTransport };
};
