const { Router } = require('express');
const prisma = require('../../prisma/client');
const authMiddleware = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = Router();

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Multer configuration to accept multiple image uploads
const upload = multer({ storage, fileFilter });

// Route to create template with multiple images
router.post('/createTemplate', authMiddleware('USER', 'ADMIN'), upload.array('images'), async (req, res) => {
    const {
        title,
        description,
        topic,
        tags,  // This will be a string or an array
        isPublic,
        allowedUsers,  // This is an array of emails from frontend
    } = req.body;

    // Get uploaded images paths
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const adminId = req.user.id;

    try {
        // Handle tags as an array
        let tagsArray = [];
        if (tags) {
            tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        }

        let usersToConnect = [];

        if (!isPublic && allowedUsers && allowedUsers.length > 0) {
            const users = await prisma.user.findMany({
                where: {
                    email: {
                        in: allowedUsers,
                    },
                },
            });

            if (users.length !== allowedUsers.length) {
                return res.status(400).json({ error: 'Some emails are invalid' });
            }

            usersToConnect = users.map(user => ({ id: user.id }));
        }

        // Create template with multiple images
        const newTemplate = await prisma.template.create({
            data: {
                title,
                description,
                topic,
                tags: tagsArray,  // Store tags as an array
                images: imagePaths,  // Store multiple images as an array
                isPublic: isPublic === 'true',  // Ensure isPublic is a boolean
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
