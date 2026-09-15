---
title: "Which way does -p 8080:80 point"
description: "Docker port mapping direction, who answers DNS inside a container, and what Tailscale actually is under the 100.x addresses."
publishDate: "15 September 2026"
tags: ["networking", "docker", "learning", "software development"]
draft: true
---

<!-- FACT-CHECK: Tailscale/WireGuard mechanism below is from the marker's own knowledge, not verified against a primary source. Check before publishing. -->

Question: who can connect in each case - `-p 8080:80`, `-p 127.0.0.1:8080:80`, and `-p 100.110.x.x:8080:80`?

I hedged on the order and picked wrong - a coin flip I've apparently been making by feel for years without ever confirming which way it actually goes. It's **host:container**, always. So:

- `-p 8080:80` - anyone who can reach the host on 8080 gets the container's port 80.
- `-p 127.0.0.1:8080:80` - only the host machine itself can connect, since it's bound to loopback.
- `-p 100.x:8080:80` - bound only to the Tailscale interface, so only your tailnet can reach it. It's not forwarding anything remote, it's just choosing which local interface to listen on.

One thing I didn't know at all: Docker's port publishing bypasses `ufw`. A firewall rule blocking a port doesn't stop Docker from publishing it anyway, because Docker writes its own iptables rules ahead of ufw's.

## Who answers the DNS query

Question: inside a container on a user-defined network, `postgres` resolves to an IP. Who answers that?

Got this one right: Docker's own embedded DNS server, reachable at `127.0.0.11` inside the container.

## What Tailscale actually is

Question: what does Tailscale do so two machines behind different home routers reach each other on `100.x` addresses?

I called it a DNS system. It's not - it's a WireGuard mesh. A coordination server exchanges public keys and current addresses between your machines, the machines then try to punch a direct path through NAT, and when that fails, DERP relays carry the traffic instead. It operates at layer 3 (IP), not the DNS layer. MagicDNS, the `.ts.net` hostnames, is a separate feature built on top of the mesh, not the mesh itself.

<!-- TODO: connect this to the actual heyfirst-lab tailnet setup, if worth naming publicly -->
