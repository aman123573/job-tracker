const redis = require('../config/redis');

const rateLimiter = async (req, res, next) => {
    const userId = req.user.id;
    const key = `rate_limit:${userId}`;
    const LIMIT = 10;
    const WINDOW = 60; // 60 seconds

    try {
        const requests = await redis.incr(key);

        if (requests === 1) {
            // first request — set expiry
            await redis.expire(key, WINDOW);
        }

        if (requests > LIMIT) {
            const ttl = await redis.ttl(key);
            return res.status(429).json({
                message: 'Too many requests. Please try again later.',
                retry_after_seconds: ttl
            });
        }

        // attach rate limit info to response headers
        res.setHeader('X-RateLimit-Limit', LIMIT);
        res.setHeader('X-RateLimit-Remaining', LIMIT - requests);

        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = rateLimiter;