const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();



router.post('/templates/:id/questions', authMiddleware('ADMIN', 'AUTHOR'), async (req, res) => {
    const { text, type, description } = req.body; // 👈 include description
    const templateId = parseInt(req.params.id, 10);

    if (!text || !type) {
        return res.status(400).json({ error: "Text and type are required" });
    }

    try {
        const template = await prisma.template.findUnique({ where: { id: templateId } });
        if (!template) return res.status(404).json({ error: "Template not found" });

        const newQuestion = await prisma.question.create({
            data: {
                text,
                type,
                description: description || '',
                templateId,
            },
        });

        return res.status(201).json({ message: "Question added successfully", question: newQuestion });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});


router.put('/templates/:templateId/questions/:questionId', authMiddleware('ADMIN', 'AUTHOR'), async (req, res) => {
    const { text, type, description } = req.body; // 👈 include description
    const { templateId, questionId } = req.params;

    if (!text || !type) {
        return res.status(400).json({ error: 'Text and type are required' });
    }

    try {
        const template = await prisma.template.findUnique({
            where: { id: parseInt(templateId, 10) },
            select: { authorId: true },
        });

        if (!template) return res.status(404).json({ error: 'Template not found' });

        const question = await prisma.question.findUnique({ where: { id: parseInt(questionId, 10) } });
        if (!question) return res.status(404).json({ error: 'Question not found' });

        if (req.user.role !== 'ADMIN' && template.authorId !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to edit this question' });
        }

        const updatedQuestion = await prisma.question.update({
            where: { id: parseInt(questionId, 10) },
            data: { text, type, description: description || '' }, // 👈 update description too
        });

        return res.json({ message: 'Question updated successfully', question: updatedQuestion });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});





// Delete a Question (Only accessible by admin or template author)
router.delete('/templates/:templateId/questions/:questionId', authMiddleware('ADMIN', 'AUTHOR'), async (req, res) => {
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
