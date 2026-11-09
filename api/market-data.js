export default async function handler(req, res) {
  const hasLseg = Boolean(process.env.LSEG_CLIENT_ID && process.env.LSEG_CLIENT_SECRET);
  const hasLegacy = Boolean(process.env.LSEG_ACCESS_TOKEN);
  if (!hasLseg && !hasLegacy) {
    return res.status(200).json({
      configured: false,
      provider: "LSEG",
      message: "LSEG credentials are not configured. Add credentials as encrypted Vercel environment variables to enable live market data."
    });
  }
  // Credential presence is not equivalent to a working market-data session.
  // Implement the account-specific LSEG Workspace/Real-Time API adapter only after
  // confirming the user's entitled instruments, endpoint, and OAuth flow.
  return res.status(503).json({
    configured: false,
    provider: "LSEG",
    message: "Credentials detected, but the LSEG market-data adapter has not yet been validated. No substitute or simulated data will be shown."
  });
}