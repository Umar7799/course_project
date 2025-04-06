const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();


// Answer route
router.post('/forms/submit', authMiddleware('USER'), async (req, res) => {
    const { templateId, answers } = req.body;

    if (!templateId || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Template ID and answers are required' });
    }

    try {
        // 1. Create the form linked to the user and template
        const newForm = await prisma.form.create({
            data: {
                userId: req.user.id,
                templateId: parseInt(templateId, 10),
            }
        });

        // 2. Create all answers
        const answerData = answers.map((ans) => ({
            response: ans.response,
            questionId: ans.questionId,
            formId: newForm.id,
        }));

        await prisma.answer.createMany({ data: answerData });

        return res.status(201).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error("❌ Error submitting form:", error);
        return res.status(500).json({ error: 'Something went wrong while submitting the form' });
    }
});



// Get User's Submitted Forms
router.get('/forms', authMiddleware('USER'), async (req, res) => {
    try {
        const forms = await prisma.form.findMany({
            where: { userId: req.user.id },
            include: {
                template: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    }
                }
            }
        });

        if (forms.length === 0) {
            return res.status(404).json({ error: 'No forms submitted yet.' });
        }

        return res.json(forms);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


// Get a Specific Form by ID
router.get('/forms/:id', authMiddleware('USER'), async (req, res) => {
    const { id } = req.params;

    try {
        const form = await prisma.form.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                template: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    }
                },
                answers: {
                    select: {
                        response: true,
                        question: {
                            select: {
                                text: true
                            }
                        }
                    }
                }
            }
        });

        if (!form || form.userId !== req.user.id) {
            return res.status(404).json({ error: 'Form not found or access denied' });
        }

        return res.json(form);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


module.exports = router;