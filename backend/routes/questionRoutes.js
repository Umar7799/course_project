const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();



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
