import React, { ReactElement } from "react";
import { Hydrate } from "react-query/hydration";
import Head from "next/head";
import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";

import "@/styles/global.css";
import { useAnalytics } from "@/lib/analytics";

export default function App({ Component, pageProps }: AppProps): ReactElement {
  const queryClientRef = React.useRef<QueryClient>();
  useAnalytics();

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <Hydrate state={pageProps.dehydratedState}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </Hydrate>
    </QueryClientProvider>
  );
}
