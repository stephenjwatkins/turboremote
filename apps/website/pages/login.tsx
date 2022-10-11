import type { NextPage } from "next";
import Head from "next/head";
import { LoginScreen } from "../screens/Login";

const Login: NextPage = () => {
  return (
    <>
      <Head>
        <title>Login — Turboremote</title>
      </Head>
      <LoginScreen />
    </>
  );
};

export default Login;
