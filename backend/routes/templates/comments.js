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


router.put('/comments/:id', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const { text } = req.body;
    const commentId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
    }

    try {
        const comment = await prisma.comment.update({
            where: { id: commentId },
            data: {
                text,  // Update the text
            },
            include: {
                user: {  // Include the user data in the updated comment
                    select: {
                        id: true,
                        name: true,  // Make sure you select the `name` as well
                    },
                },
            },
        });

        return res.json(comment); // Return updated comment with user data
    } catch (error) {
        console.error('❌ Error updating comment:', error);
        return res.status(500).json({ error: 'Could not update comment' });
    }
});


router.delete('/comments/:id', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const commentId = parseInt(req.params.id, 10);

    try {
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Optional: Only allow author or admin to delete
        if (existingComment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('❌ Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});










module.exports = router;
