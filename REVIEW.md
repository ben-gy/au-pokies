# Pokies Losses (AU) — Build Review

This file exists only to create a reviewable PR. All code is already deployed on `main`.

**Merge this PR to acknowledge the build.** Closing without merging is also fine.

## Links

- **GitHub Pages:** https://ben-gy.github.io/au-pokies/ *(redirects to custom domain once DNS is set)*
- **Custom domain:** https://au-pokies.benrichardson.dev *(live after DNS + cert below)*

## DNS setup

Already provisioned in Cloudflare (`benrichardson.dev` zone):

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `au-pokies` | `ben-gy.github.io` | DNS only (grey cloud) |

If the TLS cert isn't live, re-trigger issuance:
```bash
gh api repos/ben-gy/au-pokies/pages -X PUT -f cname=""
sleep 3
gh api repos/ben-gy/au-pokies/pages -X PUT -f cname="au-pokies.benrichardson.dev"
```
