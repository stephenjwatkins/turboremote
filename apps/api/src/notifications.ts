import { encoding } from "@turboremote/lib";
import { ServerClient, TemplatedMessage } from "postmark";

export async function sendEmail(email: TemplatedMessage) {
  if (!process.env.POSTMARK_TOKEN) {
    console.log("Sent email:");
    console.log(JSON.stringify(email));
    return;
  }

  const client = new ServerClient(process.env.POSTMARK_TOKEN);
  return await client.sendEmailWithTemplate(email);
}

export async function sendLoginEmail({
  email,
  hash: hashUuid,
}: {
  email: string;
  hash: string;
}) {
  const hash = encoding.uuidToBase64(hashUuid);
  return await sendEmail({
    From: "hello@turboremote.org",
    To: email,
    TemplateAlias: "turboremote-login-link",
    TemplateModel: {
      login_url: process.env.LOGIN_URL?.replace("<code>", hash),
    },
  });
}
