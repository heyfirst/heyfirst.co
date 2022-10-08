import React, { ReactElement } from "react";
import Head from "next/head";
import Providers from "@/components/providers";
import { AppProps } from "next/app";

import "@/styles/index.css";

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    <Providers>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
        <link
          href="https://fonts.cdnfonts.com/css/jetbrains-mono?styles=60145,60142"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </Providers>
  );
}
