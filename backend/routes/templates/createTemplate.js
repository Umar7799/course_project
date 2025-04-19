const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

router.post('/createTemplate', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    console.log("🔹 Request received to create a template");

    const {
        title,
        description,
        topic,
        tags,
        image,
        isPublic,
        allowedUsers, // this is an array of emails from frontend
    } = req.body;

    const adminId = req.user.id;

    try {
        let usersToConnect = [];

        if (!isPublic && allowedUsers && allowedUsers.length > 0) {
            // 🔍 Fetch users by email
            const users = await prisma.user.findMany({
                where: {
                    email: {
                        in: allowedUsers, // emails from frontend
                    },
                },
            });

            if (users.length !== allowedUsers.length) {
                return res.status(400).json({ error: 'Some emails are invalid' });
            }

            usersToConnect = users.map(user => ({ id: user.id })); // ✅ get IDs
        }

        const newTemplate = await prisma.template.create({
            data: {
                title,
                description,
                topic,
                tags,
                image: image || null,
                isPublic,
                authorId: adminId,
                allowedUsers: {
                    connect: usersToConnect,
                },
            },
        });

        res.status(201).json({ success: true, template: newTemplate });
    } catch (err) {
        console.error('❌ Error creating template:', err);
        res.status(500).json({ error: 'Failed to create template' });
    }


});

router.delete('/templates/:id', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);

    try {
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Only admin or owner can delete
        if (template.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You are not allowed to delete this template' });
        }

        await prisma.template.delete({
            where: { id: templateId },
        });

        return res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting template:', error);
        return res.status(500).json({ error: 'Something went wrong while deleting the template' });
    }
});

module.exports = router;
