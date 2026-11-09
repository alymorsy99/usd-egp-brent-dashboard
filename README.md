# USD/EGP × Brent Market Co-Movement

A separate Vite + Vercel dashboard for comparing USD/EGP and Brent crude.

## Current state
- UI scaffold: complete
- Indexed price comparison and rolling Pearson correlation panels: ready for provider observations
- Data endpoint: explicit unconfigured state; no fabricated or silently substituted data
- LSEG adapter: pending confirmation of entitled API product, endpoint, instrument identifiers and OAuth flow

## Environment variables
Configure encrypted server-side Vercel variables only after confirming the approved LSEG authentication method. Never expose credentials in browser code.

## Methodology
- Rebase both price series to 100 at the first common observation.
- Calculate returns from aligned observations.
- Calculate rolling Pearson correlation on daily returns, not price levels.
- Do not forward-fill missing observations.
