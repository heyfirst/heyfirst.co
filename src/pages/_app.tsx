import React, { ReactElement } from "react";
import Providers from "@/components/providers";
import { AppProps } from "next/app";

import "@/styles/global.css";

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
