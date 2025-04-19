const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

router.post('/templates/:id/allow', authMiddleware(), async (req, res) => {
    const { email } = req.body;
    const templateId = parseInt(req.params.id);
    const requestingUser = req.user;

    try {
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template || template.authorId !== requestingUser.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const userToAllow = await prisma.user.findUnique({
            where: { email },
        });

        if (!userToAllow) {
            return res.status(404).json({ message: 'User not found' });
        }

        await prisma.template.update({
            where: { id: templateId },
            data: {
                allowedUsers: {
                    connect: { id: userToAllow.id },
                },
            },
        });

        res.status(200).json({ message: 'User added' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/templates/:id/allow', authMiddleware(), async (req, res) => {
    const { email } = req.body;
    const templateId = parseInt(req.params.id);
    const requestingUser = req.user;

    try {
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template || template.authorId !== requestingUser.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const userToRemove = await prisma.user.findUnique({
            where: { email },
        });

        if (!userToRemove) {
            return res.status(404).json({ message: 'User not found' });
        }

        await prisma.template.update({
            where: { id: templateId },
            data: {
                allowedUsers: {
                    disconnect: { id: userToRemove.id },
                },
            },
        });

        res.status(200).json({ message: 'User removed' });
    } catch (error) {
        console.error('Error removing user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
