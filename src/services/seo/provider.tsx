import { DefaultSeo } from "next-seo";
import * as React from "react";
import { defaultSEO } from "./config";

export function SEO() {
  return (
    <>
      <DefaultSeo {...defaultSEO} />
    </>
  );
}
