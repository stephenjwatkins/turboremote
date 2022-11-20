export const sendEvent = (name: string, props?: Object) => {
  gtag("event", name, props);
};
