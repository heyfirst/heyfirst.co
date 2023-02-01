import { RemixBrowser } from "@remix-run/react";
import { type DOMAttributes, startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import "giscus";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["giscus-widget"]: Partial<DOMAttributes<any> & Record<string, any>>;
    }
  }
}

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });
}

if (typeof requestIdleCallback === "function") {
  requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1);
}
