## Submission — Production hardening

**Your name:** <!-- e.g. Arnab ROy-->
**Tool used:** <!-- Roo Code -->

### What I changed
<!-- 1–3 lines on how you hardened the app -->

### Definition of Done
- [ ] No secrets in source — `ADMIN_KEY` read from `process.env`
- [ ] All input validated server-side with zod — `400` on bad input
- [ ] No `dangerouslySetInnerHTML` on user content (XSS fixed)
- [ ] Authorization enforced server-side — DELETE returns `403` without valid credentials
- [ ] No silent `catch {}` — errors logged and a `500` returned
- [ ] Hallucinated `formatRelativeTime` removed or implemented (no new dependency)
- [ ] Vitest tests added and passing (`npm test`)
- [ ] I read my own diff line-by-line

> Only `zod` and `vitest` may be added as dependencies.
> CI runs automatically — aim for all checks green. For instructional purposes only · © CodeClouds.
