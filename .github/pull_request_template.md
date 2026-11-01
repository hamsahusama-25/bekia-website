## What and why
<!-- One or two sentences. Link the task / seat if there is one. -->

## How to check it
<!-- Commands or clicks a reviewer can follow. -->

## Checklist
- [ ] Branch name follows `type/seatN-short-description` (for example `feat/seat5-geonear-route`)
- [ ] `npm test` passes in `backend/` (success **and** negative cases for what I changed)
- [ ] `npm run build` passes in `frontend/` if I touched it
- [ ] No secrets, passwords, tokens, QR codes or real personal data in code, tests or logs
- [ ] API change? `docs/06-api.md` is updated in this same PR
- [ ] Architecture change? A new or updated ADR in `docs/adr/`
- [ ] A reviewer from another seat has been requested
