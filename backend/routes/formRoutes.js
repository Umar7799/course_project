const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();


// Answer route
router.post('/forms/submit', authMiddleware(), async (req, res) => {
    const { templateId, answers } = req.body;
    const userId = req.user.id;
  
    if (!templateId || !answers || answers.length === 0) {
      return res.status(400).json({ error: 'Template ID and answers are required' });
    }
  
    try {
      // Create a new form entry
      const newForm = await prisma.form.create({
        data: {
          userId,
          templateId,
          answers: {
            create: answers.map(answer => ({
              questionId: answer.questionId,
              response: answer.response,
            })),
          },
        },
      });
  
      return res.status(201).json({ message: 'Form submitted successfully', form: newForm });
    } catch (error) {
      console.error('❌ Error submitting form:', error);
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