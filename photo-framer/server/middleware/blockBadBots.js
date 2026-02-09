// Block known bad bots and scrapers
const BLOCKED_USER_AGENTS = [
  /curl/i,
  /wget/i,
  /python-requests/i,
  /python-urllib/i,
  /scrapy/i,
  /httpx/i,
  /aiohttp/i,
  /img2dataset/i,
  /CCBot/i,
  /GPTBot/i,
  /ChatGPT/i,
  /Google-Extended/i,
  /anthropic-ai/i,
  /ClaudeBot/i,
  /Bytespider/i,
  /PetalBot/i,
  /FacebookBot/i,
  /Applebot-Extended/i,
  /Omgilibot/i,
  /PerplexityBot/i,
];

// Allow legitimate bots
const ALLOWED_BOTS = [
  /Googlebot/i,
  /Bingbot/i,
  /DuckDuckBot/i,
];

export function blockBadBots(req, res, next) {
  const userAgent = req.get('User-Agent') || '';

  // Skip if no user agent
  if (!userAgent) {
    // Log suspicious requests without user agent
    console.warn(`Request without User-Agent from ${req.ip} to ${req.path}`);
    return next();
  }

  // Check if it's an allowed bot
  if (ALLOWED_BOTS.some(pattern => pattern.test(userAgent))) {
    return next();
  }

  // Check if it's a blocked bot
  if (BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent))) {
    console.warn(`Blocked bot: ${userAgent} from ${req.ip}`);
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
}
