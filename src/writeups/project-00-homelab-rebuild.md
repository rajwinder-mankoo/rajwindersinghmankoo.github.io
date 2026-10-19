---
layout: writeup.njk
title: "Project 00: Rebuilding the Homelab From Bare Metal"
date: 2026-10-18
summary: "Wiping three machines, reinstalling Proxmox, and rebuilding the lab around one idea: nothing is exposed, every credential does one job, and the machines that heat my room only run when I need them."
draft: true
permalink: false
---

<!-- DRAFT: review and rewrite in your own voice before publishing.
     OPSEC: keep internal IPs, hostnames, token names, and subdomains out of this post. -->

## Why start over

The lab had grown the way homelabs do: one service at a time, each decision reasonable on its own, the whole thing harder to explain every month. A new ISP meant a new home subnet anyway, so I backed everything up and wiped all three machines.

The goal for the rebuild was simple to say: everything documented, nothing exposed to the internet directly, and every credential scoped to exactly one job.

## The hardware

Three machines, each with a different job:

- **Dell OptiPlex 5070.** The lowest-power box, so it is the one that stays on. It runs my personal services, backups, the management dashboard, and the tunnel connector.
- **Dell Precision 3640.** On demand. Lab VMs and experiments.
- **iMac (2019, i9, 64 GB).** On demand. The heaviest lab workloads. Running Proxmox on a Mac came with its own lessons, below.

## Decision: no cluster

The obvious move with three Proxmox nodes is to cluster them. I didn't.

The lab lives in my bedroom, and three machines running around the clock make it hot. A Proxmox cluster needs a majority of nodes online to make changes, so powering two machines down would leave the third unable to start or stop anything. High availability wasn't on the table either, since every node uses local storage.

Instead, each node stands alone, and **Proxmox Datacenter Manager** gives me one dashboard across all three. The on-demand machines can be shut off without breaking anything else. It was the right trade for a lab that has to coexist with a room I sleep in.

## Remote access without opening a single port

Nothing in the lab accepts inbound connections from the internet.

- **Cloudflare Tunnel** makes an outbound-only connection from a small, dedicated container. The router has no port forwards.
- **Cloudflare Access** sits in front of every published app. Before a request ever reaches my network, the visitor has to prove who they are with a one-time code sent to an allowed email address. Each app has its own policy.
- The connector runs in its **own container**, separate from the services it publishes. If an app were compromised, the tunnel credentials would not be sitting next to it.
- For my phone's photo backups I use **Tailscale** instead of the tunnel. The free Cloudflare plan caps each upload at 100 MB, and long phone videos are bigger than that.

I tested it the honest way: a friend on another continent tried to get in. He hit the Access login and went no further without the code from my inbox.

## Least privilege, everywhere

The part of this rebuild I'm proudest of is how little each credential can do:

- **SSH** accepts keys only, with one key per device, so losing a laptop means revoking one key, not all of them.
- **Every admin interface** requires TOTP, with recovery codes kept offline.
- **Dashboards get read-only API tokens.** The management dashboard has admin rights to the nodes it manages, and nothing else.
- **A friend I lab with** has his own accounts, scoped to the two lab machines. He can build and break VMs there, but he can't see the machine that holds my personal data, and he can't grant anyone else access.

## Things that cost me time

The small stuff took longer than the big stuff:

- **Fresh Proxmox installs ship with the enterprise repositories enabled**, so the first update fails with a 401. Disabling them by appending a line didn't work, because the new `.sources` format treats a blank line as the start of a new entry. Renaming the files so apt ignores them did.
- **The iMac ignored the boot-menu key** until I used a plain wired keyboard plugged straight into it. Then the installer hung on a black screen from my multi-ISO USB tool until I switched it to its alternate boot mode.
- **I typed an IP address that was already in use.** Two machines with the same address both drop off the network unpredictably. Unplugging the cable before first boot and fixing it at the console saved a lot of confusion.
- **The iMac's startup chime** lives in the Mac's firmware settings, not the OS, so turning it off from Linux meant writing one byte to an EFI variable.

## What's next

The lab now has a foundation I can explain end to end. Next up is a custom control panel to manage it, backups with an offsite copy, and an isolated network segment for lab VMs. Those will get their own writeups.
