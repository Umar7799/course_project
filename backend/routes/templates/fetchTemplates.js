const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

router.get('/templates', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { topic } = req.query;

    try {
        // Base query for templates with necessary relations
        const baseQuery = {
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                isPublic: true,
                topic: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                allowedUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        };

        // Admin sees all templates
        if (userRole === 'ADMIN') {
            const templates = await prisma.template.findMany({
                ...baseQuery,
                where: topic ? { topic } : {}
            });
            return res.json(templates);
        }

        // Regular user sees:
        // 1. Public templates
        // 2. Templates they created
        // 3. Templates shared with them (allowedUsers)
        const templatesData = await prisma.template.findMany({
            ...baseQuery,
            where: {
                OR: [
                    { isPublic: true },  // Public templates
                    { authorId: userId },  // Templates created by the user
                    {
                        allowedUsers: {
                            some: {
                                id: userId  // Templates shared with the user
                            }
                        }
                    }
                ],
                ...(topic && { topic }),  // Filter by topic if provided
            }
        });

        // Apply the filtering in case additional logic is needed
        const verifiedTemplates = templatesData.filter(template =>
            template.isPublic ||
            template.author?.id === userId ||
            template.allowedUsers?.some(u => u.id === userId)
        );

        res.json(verifiedTemplates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
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

router.get('/templates/:templateId/forms', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const { templateId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // Get template with comments and likes
        const template = await prisma.template.findUnique({
            where: { id: parseInt(templateId, 10) },
            include: {
                comments: {
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                likes: {
                    include: {
                        user: { select: { id: true, name: true } }
                    }
                },
                questions: {
                    select: { id: true, text: true, position: true }
                }
            }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        if (template.authorId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        // Get forms with answers
        const forms = await prisma.form.findMany({
            where: { 
                templateId: parseInt(templateId, 10),
                answers: { some: {} }
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                answers: {
                    include: {
                        question: { select: { text: true, position: true } }
                    },
                    orderBy: { question: { position: 'asc' } }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        return res.json({
            template: {
                id: template.id,
                title: template.title,
                comments: template.comments,
                likes: template.likes,
                questions: template.questions
            },
            forms,
            userHasLiked: template.likes.some(like => like.userId === userId),
            likeCount: template.likes.length
        });
    } catch (error) {
        console.error('Error fetching template results:', error);
        return res.status(500).json({ 
            error: 'Failed to load template results',
            details: error.message 
        });
    }
});


// Get a template and its questions + answers + userIds via forms
router.get('/templates/:id/full', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

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
                images: true,
                createdAt: true,
                authorId: true,
                allowedUsers: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                questions: {
                    orderBy: { position: 'asc' },  // ✅ Sort questions by position
                    select: {
                        id: true,
                        text: true,
                        description: true,
                        type: true,
                        showInAnswersTable: true,   // ✅ select new field
                        position: true,              // ✅ select position field
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
                        userId: true,
                    },
                },
            },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // 🛡️ Access control check here
        const isAuthor = template.authorId === userId;
        const isPublic = template.isPublic;
        const isAllowed = template.allowedUsers.some(user => user.id === userId);

        if (!isPublic && !isAuthor && !isAllowed && userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'You do not have access to this template' });
        }

        return res.json(template);


        // Log the template object to inspect it before returning it
        console.log(template); // <-- Add this log to inspect the structure

        // Send the response containing the template data
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