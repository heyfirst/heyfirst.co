import React, { ReactElement } from "react";
import { Hydrate } from "react-query/hydration";
import Head from "next/head";
import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import Script from "next/script";

import "@/styles/global.css";

export default function App({ Component, pageProps }: AppProps): ReactElement {
  const queryClientRef = React.useRef<QueryClient>();

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
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-3TZ47KP0Q7"
        strategy="afterInteractive"
      />
      <Script
        id="gtag-dataLayer"
        dangerouslySetInnerHTML={{
          __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-3TZ47KP0Q7');`,
        }}
      />
    </QueryClientProvider>
  );
}
