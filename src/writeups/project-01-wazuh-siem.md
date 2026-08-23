---
layout: writeup.njk
title: "Project 01: Standing Up a Wazuh SIEM From Nothing"
date: 2026-08-01
summary: "Deploying a single-node Wazuh SIEM on a freshly-discovered hypervisor: storage tradeoffs, two real bugs, and the moment MITRE ATT&CK mapping showed up without writing a single detection rule."
---

## The starting point

Project 01's whole job was simple to state and less simple to actually do: get a real SIEM running, ingesting real logs, from a machine that a week earlier I didn't even know existed. The plan had originally targeted a different hypervisor entirely, but a hardware inventory update mid-project moved the target to `c0mpl1cated-lab-pve-blue`, a Precision 3640 I'd only just added to the fleet and never touched.

That meant starting from zero on the one thing that actually matters before you provision anything: what does this host's storage actually look like?

## The storage question that turned out to have no real answer to argue about

`pvesm status` and `/etc/pve/storage.cfg` on the new host showed two pools: `local` (94GB, no support for VM disk images at all) and `local-lvm` (349GB, LVM-thin, the only pool that actually supports VM disks). Unlike the other hypervisor in the fleet, which has a genuine fast-tier-vs-capacity-tier tradeoff to reason through, this one didn't. There was exactly one usable pool, and it happened to be SSD-backed, which lines up with Wazuh's own "preferably SSD" sizing guidance without me having to compromise on anything. Sometimes the right answer really is the boring one.

VM spec: 4 vCPU, 8GB RAM, 80GB disk, SCSI bus with Discard enabled so space freed inside the guest actually returns to the thin pool instead of sitting allocated forever. Ubuntu Server 24.04 LTS, matching the rest of the fleet's OS choice: one less hardening playbook to maintain.

## Bug #1: trusting a placeholder as if it were a value

The Wazuh installer command I'd planned around was:

```
curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh
```

First run failed instantly:

```
./wazuh-install.sh: line 1: syntax error near unexpected token 'newline'
./wazuh-install.sh: line 1: '<?xml version="1.0" encoding="UTF-8"?>'
```

`4.x` isn't a real path. It's how Wazuh's own docs write a version placeholder they expect you to substitute. `curl -sO` doesn't fail loudly on an HTTP error; it just saves whatever came back, which in this case was an XML error body that `bash` then dutifully tried to execute as a script. Checked the actual current docs, found the real version (4.14), reran it clean:

```
curl -sO https://packages.wazuh.com/4.14/wazuh-install.sh
sudo bash ./wazuh-install.sh -a --install-dependencies
```

Manager, indexer, and dashboard all came up clean on the second attempt. Lesson that's stuck with me since: a version-pinned URL copied from planning is a claim about the past, not a fact about now. Worth a 30-second check against current docs before trusting it.

## Bug #2: the dashboard lied, the log didn't

Deployed the first agent on `c0mpl1cated-lab-cloud` (an existing OptiPlex already running real workloads, a better first target than an idle box with nothing to log). Install went clean. Dashboard said **"Never connected."**

Before assuming the agent was actually broken, I checked its own log instead of trusting the aggregating UI:

```
grep -i agentd /var/ossec/logs/ossec.log
```

Completely clean sequence: key requested, key received, connected to the manager on port 1514, no errors anywhere. Confirmed port-level connectivity independently too (`nc -zv` on 1515 and 1514, both succeeded). Everything downstream of the agent said it was working. Only the dashboard disagreed.

Refreshed the page. Agent showed **Active** immediately.

It was a stale UI, not a broken connection, but I wouldn't have known that without checking the log closer to the source first. The instinct to immediately start debugging network config would've sent me down a much longer path for a problem that didn't exist.

## The payoff

Once the agent was confirmed active, the actual validation wasn't the green status dot. It was checking whether real data was flowing. Threat Hunting dashboard, filtered to the new agent, last 24 hours:

- **57 total events**
- 5 authentication successes, 0 failures
- 0 critical (Level 12+) alerts
- Real activity already mapped to actual MITRE ATT&CK techniques (**Sudo and Sudo Caching**, **Valid Accounts**) without me writing a single custom detection rule

That last part is the one worth sitting with. Wazuh's default ruleset isn't naive. It's already producing useful, technique-mapped signal out of the box. Project 03 (Sigma detection engineering) isn't going to start from nothing; it's going to start from a baseline that already works, and the job is to extend real coverage, not invent it.

## What I'd flag if someone else were building this

- **Check current docs for version-pinned URLs, every time:** don't trust a value from planning without a fresh check
- **When a status UI and a component's own log disagree, believe the log:** check the source closer to the actual system before escalating into deeper diagnosis
- **A default ruleset is a real starting point, not a placeholder:** worth exploring what's already covered before assuming you need to build detection logic from scratch

One deliberate loose end, tracked openly rather than glossed over: SSH password authentication on this VM is still enabled by choice. I understand key-based auth conceptually but haven't implemented it yet, and didn't want to wipe a working VM over a config mistake while still learning it. It's logged as an explicit, tracked decision with a real revisit trigger, not a gap I forgot about.
