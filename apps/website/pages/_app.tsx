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
        <link rel="icon" href="/favicon@32w.png?v=2022102201" sizes="any" />
        <link
          rel="icon"
          href="/favicon.svg?v=2022102801"
          type="image/svg+xml"
        />
        <link rel="apple-touch-icon" href="/favicon@180w.png?v=2022102201" />
        <meta name="og:image" content="/social@1200w.png?v=2022102201" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
