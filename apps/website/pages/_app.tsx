import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>
          Standalone Remote Cache Provider for Turborepo — Turboremote
        </title>
        <meta
          name="description"
          content="Turboremote is a frictionless Remote Cache provider for Turborepo. Be connected in less than a minute."
        />
        <link rel="icon" href="/favicon@32w.png?v=2022101001" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon@180w.png?v=2022101001" />
        <meta name="og:image" content="/social@1200w.png?v=2022101001" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
