---
title: "A certificate for a server nobody can see"
description: "Active vs passive health checks, what happens to an in-flight request during a proxy switch, and how to get a real TLS cert for a Tailscale-only service."
publishDate: "15 September 2026"
tags: ["networking", "tls", "learning", "software development"]
draft: true
---

<!-- FACT-CHECK: ACME HTTP-01 vs DNS-01 explanation below is from the marker's own knowledge, not verified against a primary source. Check before publishing. -->

Question: what's the difference between a proxy's active and passive health checks?

Half right, and half is a strange score after 10+ years of putting services behind proxies without asking how the proxy actually decides they're alive. Active is correct: the proxy calls the service on a schedule to ask "are you healthy." Passive isn't the service pinging the proxy - it's the proxy watching real traffic as it flows through, and marking an upstream down after enough real requests time out or error.

## What happens to a live connection during a switch

Question: a proxy switches its upstream from v1 to v2. What happens to (1) a request already in flight to v1, and (2) an open websocket to v1?

Got the HTTP request right: it's allowed to finish. Got the websocket wrong - I guessed it closes immediately because "websockets don't have a lifecycle, maybe UDP." A websocket is an HTTP connection upgraded in place, so it runs over TCP like everything else. It stays open on v1 until either side closes it or a drain timeout forces it, exactly like the in-flight request. This matters directly for zero-downtime deploys: a long-lived websocket can hold a deploy open longer than you'd expect.

## Getting a cert when nobody can reach you

Question: ACME HTTP-01 vs DNS-01 - which works for a homelab service only reachable over Tailscale?

I didn't understand the question well enough to answer it. Here's the actual choice: HTTP-01 requires Let's Encrypt's servers to reach your box on port 80 from the public internet, to prove you control it. A Tailscale-only service can't satisfy that - nothing public can reach it. DNS-01 proves control a different way, by asking you to publish a specific TXT record on your domain, which works regardless of what can reach the server directly. For anything living only on a tailnet, DNS-01 is the only route to a real, publicly-trusted certificate.

<!-- TODO: note the difference between "real cert via DNS-01" and the local pihole .internal setup, which is a separate, non-public thing -->
