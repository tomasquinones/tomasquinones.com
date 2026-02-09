const ALLOWED_DOMAINS = [
  'tomasquinones.com',
  'www.tomasquinones.com',
  'localhost',
  '127.0.0.1'
];

export function hotlinkProtection(req, res, next) {
  const referer = req.get('Referer');

  // No referer - could be direct access or privacy setting
  // Allow but log for monitoring
  if (!referer) {
    console.log(`Direct access to ${req.path} from ${req.ip}`);
    return next();
  }

  try {
    const refererUrl = new URL(referer);
    const refererHost = refererUrl.hostname;

    // Check if referer is from allowed domain
    const isAllowed = ALLOWED_DOMAINS.some(domain => {
      return refererHost === domain || refererHost.endsWith(`.${domain}`);
    });

    if (!isAllowed) {
      console.warn(`Hotlink blocked: ${referer} trying to access ${req.path}`);
      return res.status(403).json({ error: 'Hotlinking is not allowed' });
    }
  } catch (error) {
    // Invalid referer URL
    console.warn(`Invalid referer: ${referer}`);
  }

  next();
}
