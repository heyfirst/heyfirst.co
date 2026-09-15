---
title: "SSH quoting and tunnels I got backwards"
description: "Single vs double quotes over SSH, ControlMaster, and which tunnel direction actually lets a server pull from your laptop's registry."
publishDate: "15 September 2026"
tags: ["ssh", "networking", "learning", "software development"]
draft: true
---

<!-- FACT-CHECK: quoting/expansion explanation and ControlMaster/ControlPersist description below are from the marker's own knowledge, not verified against a primary source. Check before publishing. -->

Question: what's the difference in output between `ssh host 'echo $HOME'` and `ssh host "echo $HOME"`?

I guessed there shouldn't be a difference. There is, and it's the kind of thing every deploy tool that shells out to remote hosts has to get right.

I've written `ssh host "some command"` hundreds of times over a decade-plus career and never once asked which shell was doing the expanding.

Single quotes mean your laptop's shell sends `$HOME` as literal text, and the **server** expands it - you get the server's home directory. Double quotes mean your **laptop's** shell expands `$HOME` before `ssh` even runs, so you get your own laptop's path, sent to the server as a string that happens to be a path. Same command, different machine doing the substitution.

## ControlMaster and ControlPersist

I'd never heard of these. `ControlMaster` opens one real SSH connection and lets later `ssh` calls to the same host reuse it through a local socket instead of renegotiating a new connection. `ControlPersist` keeps that connection alive for a while after the last command finishes, so the next command in a few seconds doesn't pay the login cost either.

For a tool running 40 commands across 5 hosts, that's the difference between 5 logins and 200.

## The tunnel direction I had backwards

Question: my laptop runs a registry on `localhost:5000`, and a server needs to `docker pull` from it. Which SSH flag makes that work?

I said port forwarding, which was right, but picked `-L`. `-L` brings a **remote** port to your laptop - that's the shape I actually use daily, forwarding a database from a private server down to localhost. Here the direction is reversed: the **server** needs to reach something on **my** laptop, which is `-R`.

```
ssh -R 5000:localhost:5000 host docker pull localhost:5000/app
```

Kamal does exactly this for local registries. Worth noticing: I use `-L` often enough that I reached for it by reflex, without checking which side actually needs to initiate the connection.

<!-- TODO: mention the actual heyfirst-private postgres tunnel setup as the contrast case, if worth naming publicly -->
