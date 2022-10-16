import { runPromiseForMinimumTime } from "@turboremote/request";
import { useEffect, useState } from "react";
import { createApi, createLoginOnce } from "../utils/api";

const api = createApi();

export const useLogin = () => {
  const [loginState, setLoginState] = useState("initial");
  useEffect(() => {
    setLoginState("pending");
    const url = new URL(window.location.href);
    const hash = url.searchParams.get("code");
    if (!hash) {
      throw new Error("Hash not provided in URL");
    }
    runPromiseForMinimumTime(createLoginOnce(api, { hash }), 2500)
      .then(() => {
        setLoginState("success");
      })
      .catch(() => {
        setLoginState("error");
      });
    return () => {};
  }, []);
  return loginState;
};
