export const devTransport = {
  target: "pino-pretty",
  options: {
    translateTime: "HH:MM:ss Z",
    ignore: "pid,hostname",
  },
};

export const getLogger = () => {
  return {
    transport: process.env.NODE_ENV === "production" ? undefined : devTransport,
  };
};
