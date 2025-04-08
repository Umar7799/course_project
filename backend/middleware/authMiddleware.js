const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client'); // Import Prisma client for checking ownership

// Middleware for authenticating users and checking roles (optional)
// Updated authMiddleware to support multiple roles and ownership validation
const authMiddleware = (...requiredRoles) => async (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    let token = req.headers.authorization;
    if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check if user exists in the database
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the role is valid
        if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. Insufficient privileges.' });
        }

        // Check ownership for templates/questions if applicable
        if (req.params.id) {
            // Check if we're dealing with a template or a question
            const resourceType = req.originalUrl.includes('/templates') ? 'template' : 'question';

            // Fetch the resource (template or question) by its ID
            let resource;
            if (resourceType === 'template') {
                resource = await prisma.template.findUnique({
                    where: { id: parseInt(req.params.id) },
                    select: { authorId: true },
                });
            } else if (resourceType === 'question') {
                resource = await prisma.question.findUnique({
                    where: { id: parseInt(req.params.id) },
                    select: { template: { select: { authorId: true } } },
                });
            }

            if (resource) {
                const isOwner = resource.authorId === req.user.id;
                if (resourceType === 'question' && resource.template.authorId !== req.user.id && !isOwner) {
                    return res.status(403).json({ error: 'Forbidden. You are neither the author nor an admin.' });
                }

                if (resourceType === 'template' && !isOwner) {
                    return res.status(403).json({ error: 'Forbidden. You are not the author of this template.' });
                }
            } else {
                return res.status(404).json({ error: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found` });
            }
        }

        // If everything is fine, proceed to the next middleware or route handler
        next();

    } catch (error) {
        console.error("JWT Error:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token. Authorization denied.' });
    }
};

module.exports = authMiddleware;
