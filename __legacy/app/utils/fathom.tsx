import { useLocation } from "@remix-run/react";
import { load, trackPageview } from "fathom-client";
import { useEffect, useRef } from "react";

const Fathom = () => {
  const clientMonted = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (clientMonted.current) return;

    load("JAZCXEME", {
      includedDomains: ["heyfirst.co"],
      excludedDomains: ["vercel.app,localhost"],
    });
    clientMonted.current = true;
  }, []);

  useEffect(() => {
    trackPageview();
  }, [location.pathname, location.search]);

  return null;
};

export default Fathom;
