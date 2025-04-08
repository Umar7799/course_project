const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();




// Create Template (Only accessible by admins)
// Create Template (Only accessible by admins)
router.post('/createTemplate', authMiddleware('ADMIN'), async (req, res) => {
    console.log("🔹 Request received to create a template"); // Debug log

    const { title, description, isPublic, topic, tags, image } = req.body;  // Destructure new fields
    console.log("🔹 Request body:", req.body); // Debug log

    // Validate input
    if (!title || !description || !topic || !tags || !image) {  // Make sure new fields are provided
        console.log("❌ Missing required fields");
        return res.status(400).json({ error: 'Title, description, topic, tags, and image are required' });
    }

    try {
        console.log("🔹 Admin ID:", req.user.id); // Debug log

        // Create a new template with the new fields
        const newTemplate = await prisma.template.create({
            data: {
                title,
                description,
                isPublic: isPublic !== undefined ? isPublic : false,  // Default to true if not provided
                topic,
                tags,
                image,
                authorId: req.user.id,  // Make sure this is correct!
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
    
    try {
        // If the user is an admin, show all templates
        if (userRole === 'ADMIN') {
            const templates = await prisma.template.findMany({
                select: { 
                    id: true, 
                    title: true, 
                    description: true, 
                    createdAt: true,
                    isPublic: true // ✅ Include this!
                },
            });
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
                },
                select: { 
                    id: true, 
                    title: true, 
                    description: true, 
                    createdAt: true,
                    isPublic: true // ✅ Include this!
                },
            });
            return res.json(templates);
        }

        // Fallback: Only public templates are shown if not admin or creator
        const templates = await prisma.template.findMany({
            where: { isPublic: true },
            select: { 
                id: true, 
                title: true, 
                description: true, 
                createdAt: true,
                isPublic: true // ✅ Include this!
            },
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

        const user = req.user || {};

        if (template.isPublic || user.id === template.authorId || user.role === 'ADMIN') {
            return res.json(template);
        }

        return res.status(403).json({ error: 'Forbidden' });

    } catch (error) {
        console.error("❌ Error fetching template with questions:", error);
        return res.status(500).json({ error: 'Server error while retrieving template details' });
    }
});

// Add a Question to a Template (Admin Only)
router.post('/templates/:id/questions', authMiddleware('ADMIN'), async (req, res) => {
    const { text, type } = req.body;
    const templateId = parseInt(req.params.id, 10);

    // Validate input
    if (!text || !type) {
        return res.status(400).json({ error: "Text and type are required" });
    }

    try {
        // Check if the template exists
        const template = await prisma.template.findUnique({ where: { id: templateId } });
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // Create the question
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

// Edit Template (Only accessible by admins)
router.put('/templates/:id', authMiddleware('ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
    const { title, description, isPublic } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
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

module.exports = router;


