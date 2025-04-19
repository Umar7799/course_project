const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

// POST /templates/:id/like - Like a template
router.post('/templates/:id/like', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    try {
        const existing = await prisma.like.findFirst({
            where: {
                templateId,
                userId,
            },
        });

        if (existing) {
            return res.status(400).json({ error: 'Template already liked' });
        }

        const like = await prisma.like.create({
            data: {
                templateId,
                userId,
            },
        });

        return res.status(201).json(like);
    } catch (error) {
        console.error('❌ Error liking template:', error);
        return res.status(500).json({ error: 'Server error while liking template' });
    }
});


// GET /templates/:id/likes - Get total likes
router.get('/templates/:id/likes', async (req, res) => {
    const templateId = parseInt(req.params.id, 10);

    try {
        const count = await prisma.like.count({
            where: { templateId },
        });

        res.json({ templateId, likes: count });
    } catch (error) {
        console.error('❌ Error fetching like count:', error);
        res.status(500).json({ error: 'Failed to get likes' });
    }
});


// DELETE /templates/:id/like - Unlike a template
router.delete('/templates/:id/like', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    try {
        const existing = await prisma.like.findFirst({
            where: {
                templateId,
                userId,
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Like not found' });
        }

        await prisma.like.delete({
            where: { id: existing.id },
        });

        return res.status(200).json({ message: 'Like removed' });
    } catch (error) {
        console.error('❌ Error removing like:', error);
        return res.status(500).json({ error: 'Server error while removing like' });
    }
});

module.exports = router;
