const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

// POST /templates/:id/comments - Add a comment
router.post('/templates/:id/comments', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const { text } = req.body; // changed from content
    const templateId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                text, // now matches variable name
                userId,
                templateId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return res.status(201).json(comment);
    } catch (error) {
        console.error('❌ Error creating comment:', error);
        return res.status(500).json({ error: 'Could not add comment' });
    }
});


// GET /templates/:id/comments - Get all comments for a template
router.get('/templates/:id/comments', async (req, res) => {
    const templateId = parseInt(req.params.id, 10);

    try {
        const comments = await prisma.comment.findMany({
            where: { templateId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(comments);
    } catch (error) {
        console.error('❌ Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

module.exports = router;
