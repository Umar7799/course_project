const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

// Get All Templates (For admins, creators, and users)
router.get('/templates', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { topic } = req.query;

    try {
        const query = {
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                isPublic: true,
                topic: true,

            },
        };

        // Admin: get everything, apply topic filter if exists
        if (userRole === 'ADMIN') {
            const adminWhere = topic ? { topic } : {};
            const templates = await prisma.template.findMany({
                where: adminWhere,
                select: query.select,
            });
            return res.json(templates);
        }

        // Regular user: see public templates + own templates (even if private)
        if (userRole === 'USER') {
            const whereClause = {
                OR: [
                    { isPublic: true },
                    { authorId: userId },
                    { allowedUsers: { some: { id: userId } } },
                ],
            };

            if (topic) {
                whereClause.AND = [{ topic }];
            }

            const templates = await prisma.template.findMany({
                where: whereClause,
                select: query.select,
            });

            return res.json(templates);
        }

        // Just in case we somehow fall through
        return res.status(403).json({ error: 'Unauthorized access' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Get Public Templates (accessible without login)
router.get('/public/templates', async (req, res) => {
    const { topic } = req.query;
    try {
        const whereClause = {
            isPublic: true,
        };

        if (topic) {
            whereClause.topic = topic;
        }

        const templates = await prisma.template.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                isPublic: true,
                topic: true,
            },
        });

        return res.json(templates);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong while fetching public templates' });
    }
});



// Get a template and its questions + answers + userIds via forms
router.get('/templates/:id/full', async (req, res) => {
    const templateId = parseInt(req.params.id, 10);

    if (isNaN(templateId)) {
        return res.status(400).json({ error: 'Invalid template ID' });
    }

    try {
        const template = await prisma.template.findUnique({
            where: { id: templateId },
            select: {
                id: true,
                title: true,
                description: true,
                isPublic: true,
                image: true,
                createdAt: true,
                authorId: true,
                questions: {
                    select: {
                        id: true,
                        text: true,
                        type: true,
                        answers: {
                            select: {
                                id: true,
                                response: true,
                                questionId: true,
                                formId: true,
                                form: {
                                    select: {
                                        userId: true,
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                comments: {
                    select: {
                        id: true,
                        text: true,
                        createdAt: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                likes: {
                    select: {
                        userId: true, // 👈 this is key
                    },
                },
                allowedUsers: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        return res.json(template);
    } catch (error) {
        console.error("❌ Error fetching template with questions and answers:", error);
        return res.status(500).json({ error: 'Server error while retrieving template details' });
    }
});


router.put('/templates/:id', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
    const { title, description, isPublic, topic } = req.body;

    if (!title || !description || !topic) {
        return res.status(400).json({ error: 'Title, description, and topic are required' });
    }

    try {
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check if user is the owner or an admin
        if (template.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You are not allowed to edit this template' });
        }

        // ✅ Update the template
        await prisma.template.update({
            where: { id: templateId },
            data: {
                title,
                description,
                isPublic: isPublic !== undefined ? isPublic : template.isPublic,
                topic,
            },
        });

        // ✅ Fetch the updated template again, including allowedUsers
        const updatedTemplate = await prisma.template.findUnique({
            where: { id: templateId },
            include: {
                allowedUsers: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });

        return res.json({ message: 'Template updated successfully', template: updatedTemplate });
    } catch (error) {
        console.error('❌ Error updating template:', error);
        return res.status(500).json({ error: 'Something went wrong while updating the template' });
    }
});

module.exports = router;