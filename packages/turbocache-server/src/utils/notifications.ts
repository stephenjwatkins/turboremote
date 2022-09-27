import { CourierClient } from "@trycourier/courier";
import {
  ICourierSendConfig,
  ICourierSendMessageParameters,
  ICourierSendParameters,
} from "@trycourier/courier/lib/types";
import { uuidToBase64 } from "./encoding";

export async function sendEmail(
  params: ICourierSendParameters | ICourierSendMessageParameters,
  config?: ICourierSendConfig | undefined
) {
  const courier = CourierClient({
    authorizationToken: process.env.COURIER_AUTH_TOKEN,
  });
  return await courier.send(params, config);
}

export async function sendLoginEmail({
  email,
  hash: hashUuid,
}: {
  email: string;
  hash: string;
}) {
  const hash = uuidToBase64(hashUuid);
  return await sendEmail({
    message: {
      content: {
        title: "Your Turboremote Login Link",
        body: "Click this link to login:\n\nhttp://localhost:3000/logins/{{hash}}",
      },
      data: {
        hash,
      },
      to: {
        email,
      },
    },
  });
}
