import { makeApiRequest, runPromiseForMinimumTime } from "@turboremote/request";
import { useEffect, useState } from "react";
import { createApi } from "../utils/api";

const api = createApi();

export const useLogin = () => {
  const [loginState, setLoginState] = useState("initial");
  useEffect(() => {
    if (loginState !== "initial") {
      return;
    }

    setLoginState("pending");
    const url = new URL(window.location.href);
    const hash = url.searchParams.get("code");
    runPromiseForMinimumTime(
      makeApiRequest(api, "/logins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hash }),
      }),
      2500
    )
      .then(() => {
        setLoginState("success");
      })
      .catch(() => {
        setLoginState("error");
      });
  }, []);
  return loginState;
};
