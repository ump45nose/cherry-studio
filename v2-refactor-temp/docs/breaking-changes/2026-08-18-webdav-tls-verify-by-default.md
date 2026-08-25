---
title: WebDAV backup now verifies TLS certificates by default
category: changed
severity: breaking
introduced_in_pr: '#18793'
date: 2026-08-18
---

## What changed

WebDAV backups and restores now validate the server's TLS certificate by default. Previously any certificate — including one presented by a man-in-the-middle — was accepted. A new setting "Allow Self-Signed Certificates" (Settings → Data → WebDAV) restores the old behavior for servers that use self-signed or private-CA certificates.

## Why this matters to the user

Users whose WebDAV server presents a self-signed or private-CA certificate (common for self-hosted NAS setups) will see backup/restore/connection failures. Unverifiable-chain failures show a message pointing at the new setting; other certificate problems (expired, wrong hostname) show a generic failure message — those need the certificate fixed, not verification skipped. Plain-HTTP servers (e.g. LAN `http://` hosts) are not affected.

Nutstore backups use the same transport and are now verified too. `dav.jianguoyun.com` serves a publicly-trusted certificate, so normal environments are unaffected. Networks that intercept TLS (e.g. corporate proxies with an untrusted root) will fail nutstore backups with a generic error — fix the trust environment (install the corporate root certificate) rather than weakening verification; the WebDAV self-signed switch does not apply to nutstore.

## What the user should do

If your WebDAV server uses a self-signed or private-CA certificate, enable "Allow Self-Signed Certificates" in Settings → Data → WebDAV. Be aware this weakens transport security: a man-in-the-middle could intercept your WebDAV password and backup data. Everyone else needs to do nothing.

## Notes for release manager

The failure toast for certificate errors guides users to the setting. Related hardening in the same PR: backup archives are now created owner-only (0600) — this also applies to local backups written into user-chosen directories, which matters for users sharing a backup folder across accounts. Staging directories under the OS temp tree are additionally 0700.
