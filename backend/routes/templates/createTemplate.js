const { Router } = require('express');
const prisma = require('../../prisma/client');
const authMiddleware = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = Router();

// Keep your existing multer configuration
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });



router.post('/createTemplate', authMiddleware('USER', 'ADMIN'), upload.array('images'), async (req, res) => {
    const {
        title,
        description,
        topic,
        tags,
        isPublic: isPublicRaw,
        allowedUserEmails: allowedUserEmailsJson,
        questions // <- New field for questions
    } = req.body;

    // Parse questions to ensure it's an array
    let parsedQuestions = [];
    try {
        parsedQuestions = JSON.parse(questions); // Parse the stringified questions
    } catch (err) {
        return res.status(400).json({ error: 'Invalid questions format' });
    }

    const isPublic = isPublicRaw === 'true';
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const authorId = req.user.id;

    // Define the valid types based on your Prisma enum
    const validQuestionTypes = ['SINGLE_LINE', 'MULTI_LINE', 'INTEGER', 'CHECKBOX']; // Adjust according to your enum

    // Validate that the 'type' for each question is a valid 'QuestionType'
    const validatedQuestions = parsedQuestions.map(q => {
        if (!validQuestionTypes.includes(q.type)) {
            throw new Error(`Invalid question type: ${q.type}`);
        }
        return {
            text: q.text,
            description: q.description || '',
            type: q.type
        };
    });

    try {
        let tagsArray = [];
        if (tags) {
            tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        }

        let usersToConnect = [];
        if (!isPublic && allowedUserEmailsJson) {
            const allowedUserEmails = JSON.parse(allowedUserEmailsJson);
            const existingUsers = await prisma.user.findMany({
                where: {
                    email: { in: allowedUserEmails }
                }
            });
            usersToConnect = existingUsers.map(user => ({ id: user.id }));
        }

        const newTemplate = await prisma.template.create({
            data: {
                title,
                description,
                topic,
                tags: tagsArray,
                images: imagePaths,
                isPublic,
                authorId,
                allowedUsers: {
                    connect: usersToConnect
                },
                questions: {
                    create: validatedQuestions // Use validated questions
                }
            },
            include: {
                allowedUsers: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({ success: true, template: newTemplate });
    } catch (err) {
        console.error('Error creating template:', err);

        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(path.join(uploadDir, file.filename));
                } catch (cleanupErr) {
                    console.error('Error cleaning up file:', cleanupErr);
                }
            });
        }

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