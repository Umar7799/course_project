const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

// Create Template (Only accessible by admins)
router.post('/createTemplate', authMiddleware('ADMIN'), async (req, res) => {
    console.log("🔹 Request received to create a template"); // Debug log

    const { title, description, isPublic, topic, tags, image } = req.body;  // Destructure new fields
    console.log("🔹 Request body:", req.body); // Debug log

    // Validate input
    if (!title || !description || !topic || !tags) {  // Only validate the essential fields for now
        console.log("❌ Missing required fields");
        return res.status(400).json({ error: 'Title, description, topic, and tags are required' });
    }
    try {
        console.log("🔹 Admin ID:", req.user.id); // Debug log

        // Create a new template with the new fields
        const newTemplate = await prisma.template.create({
            data: {
                title,
                description,
                isPublic: isPublic !== undefined ? isPublic : false,  // Default to false if not provided
                topic,  // Add the topic
                tags,
                image: image || null,  // Make image optional, default to null if not provided
                authorId: req.user.id,  // Ensure this is the correct user ID
            },
        });

        console.log("✅ Template created successfully:", newTemplate);
        return res.json({ message: 'Template created successfully', template: newTemplate });

    } catch (error) {
        console.error('❌ Error creating template:', error);
        return res.status(500).json({ error: 'Something went wrong while creating the template' });
    }
});


// Get All Templates (For admins, creators, and users)
router.get('/templates', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const userId = req.user.id;  // Get user ID from the request (added by the auth middleware)
    const userRole = req.user.role;  // Get user role (added by auth middleware)
    const { topic } = req.query;  // Retrieve topic from query string if provided

    try {
        // Base query object for selecting templates
        let query = {
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                isPublic: true,
                topic: true,  // Include topic in the response
            },
        };

        // If topic is provided, filter by topic
        if (topic) {
            query.where = { topic };
        }

        // If the user is an admin, show all templates
        if (userRole === 'ADMIN') {
            const templates = await prisma.template.findMany(query);
            return res.json(templates);
        }

        // If the user is the creator, show all templates they created (even non-public ones)
        if (userRole === 'USER') {
            const templates = await prisma.template.findMany({
                where: {
                    OR: [
                        { isPublic: true },   // Public templates
                        { authorId: userId }, // Templates created by the logged-in user (private templates)
                    ],
                    ...query.where,  // Include topic filter if provided
                },
                select: query.select,
            });
            return res.json(templates);
        }

        // Fallback: Only public templates are shown if not admin or creator
        const templates = await prisma.template.findMany({
            where: { isPublic: true, ...query.where },  // Include topic filter if provided
            select: query.select,
        });

        return res.json(templates);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Get a template and its questions
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
                createdAt: true,
                authorId: true,
                questions: {
                    select: {
                        id: true,
                        text: true,
                        type: true
                    }
                }
            }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // If the user is logged in and has a token, proceed with sending template details
        // No need to check for `isPublic` or the user being the author at this point

        return res.json(template);
    } catch (error) {
        console.error("❌ Error fetching template with questions:", error);
        return res.status(500).json({ error: 'Server error while retrieving template details' });
    }
});

// Edit Template (Only accessible by admins)
router.put('/templates/:id', authMiddleware('ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
    const { title, description, isPublic, topic } = req.body;

    if (!title || !description || !topic) {
        return res.status(400).json({ error: 'Title, description, and topic are required' });
    }

    try {
        // Find the template to update
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Update the template
        const updatedTemplate = await prisma.template.update({
            where: { id: templateId },
            data: {
                title,
                description,
                isPublic: isPublic !== undefined ? isPublic : template.isPublic, // Only update isPublic if provided
                topic,  // Update the topic
            },
        });

        return res.json({ message: 'Template updated successfully', template: updatedTemplate });
    } catch (error) {
        console.error('❌ Error updating template:', error);
        return res.status(500).json({ error: 'Something went wrong while updating the template' });
    }
});


// Delete Template (Only accessible by admins)
router.delete('/templates/:id', authMiddleware('ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);

    try {
        // Find the template to delete
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Delete the template
        await prisma.template.delete({
            where: { id: templateId },
        });

        return res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting template:', error);
        return res.status(500).json({ error: 'Something went wrong while deleting the template' });
    }
});

// Add a Question to a Template (Admin Only)
router.post('/templates/:id/questions', authMiddleware('ADMIN'), async (req, res) => {
    const { text, type } = req.body;
    const templateId = parseInt(req.params.id, 10);

    console.log("Request Params:", req.params);         // 🔍 Debugging
    console.log("Parsed Template ID:", templateId);     // 🔍 Debugging
    console.log("Request Body:", req.body);             // 🔍 Debugging

    // ✅ Validate Template ID
    if (isNaN(templateId)) {
        return res.status(400).json({ error: "Invalid template ID in URL." });
    }

    // ✅ Validate input fields
    if (!text || !type) {
        return res.status(400).json({ error: "Text and type are required" });
    }

    try {
        // ✅ Check if the template exists
        const template = await prisma.template.findUnique({ where: { id: templateId } });
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // ✅ Create the question
        const newQuestion = await prisma.question.create({
            data: {
                text,
                type,
                templateId,
            },
        });

        return res.status(201).json({ message: "Question added successfully", question: newQuestion });

    } catch (error) {
        console.error("Error adding question:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

// Edit a Question (Only accessible by admin or template author)
router.put('/templates/:templateId/questions/:questionId', authMiddleware('ADMIN'), async (req, res) => {
    const { text, type } = req.body;
    const { templateId, questionId } = req.params;

    // Validate input
    if (!text || !type) {
        return res.status(400).json({ error: 'Text and type are required' });
    }

    try {
        // Find the template to check if the current user is the author
        const template = await prisma.template.findUnique({
            where: { id: parseInt(templateId, 10) },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Find the question to check its author
        const question = await prisma.question.findUnique({
            where: { id: parseInt(questionId, 10) },
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Ensure the user is either an admin or the author of the question (the author of the template)
        if (req.user.role !== 'ADMIN' && question.templateId !== template.id) {
            return res.status(403).json({ error: 'You are not authorized to edit this question' });
        }

        // Update the question
        const updatedQuestion = await prisma.question.update({
            where: { id: parseInt(questionId, 10) },
            data: { text, type },
        });

        return res.json({ message: 'Question updated successfully', question: updatedQuestion });
    } catch (error) {
        console.error('❌ Error updating question:', error);
        return res.status(500).json({ error: 'Something went wrong while updating the question' });
    }
});

// Delete a Question (Only accessible by admin or template author)
router.delete('/templates/:templateId/questions/:questionId', authMiddleware('ADMIN'), async (req, res) => {
    const { templateId, questionId } = req.params;

    try {
        // Find the template to check if the current user is the author
        const template = await prisma.template.findUnique({
            where: { id: parseInt(templateId, 10) },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Find the question to check its author
        const question = await prisma.question.findUnique({
            where: { id: parseInt(questionId, 10) },
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Ensure the user is either an admin or the author of the question (the author of the template)
        if (req.user.role !== 'ADMIN' && question.templateId !== template.id) {
            return res.status(403).json({ error: 'You are not authorized to delete this question' });
        }

        // Delete the question
        await prisma.question.delete({
            where: { id: parseInt(questionId, 10) },
        });

        return res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting question:', error);
        return res.status(500).json({ error: 'Something went wrong while deleting the question' });
    }
});



module.exports = router;


