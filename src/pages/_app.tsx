import React, { ReactElement } from "react";
import { Hydrate } from "react-query/hydration";
import Head from "next/head";
import { AppProps } from "next/app";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import "@/styles/global.css";
import { useAnalytics } from "@/lib/analytics";
import reactQueryClient from "@/lib/react-query";

export default function App({ Component, pageProps }: AppProps): ReactElement {
  useAnalytics();

  return (
    <QueryClientProvider client={reactQueryClient}>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      <Hydrate state={pageProps.dehydratedState}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </Hydrate>
    </QueryClientProvider>
  );
}
