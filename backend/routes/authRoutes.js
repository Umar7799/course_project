// authRoutes.js

const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

// SignUp Route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, // Include role in the token
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Get Authenticated User Profile
router.get('/profile', authMiddleware('USER'), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true } // Exclude password
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// Get All Users (Only accessible by admins)
router.get('/users', authMiddleware('ADMIN'), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true } // Exclude passwords
        });

        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});


// Create Template (Only accessible by admins)
router.post('/templates', authMiddleware('ADMIN'), async (req, res) => {
    const { title, description, public } = req.body;

    try {
        const template = await prisma.template.create({
            data: {
                title,
                description,
                public,
                authorId: req.user.id // The logged-in user is the author
            }
        });

        return res.status(201).json(template);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Get All Templates (Public and Private, accessible by everyone)
router.get('/templates', async (req, res) => {
    try {
        const templates = await prisma.template.findMany({
            where: { public: true }, // Only public templates are returned
            select: { id: true, title: true, description: true, createdAt: true }
        });

        return res.json(templates);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Get Template by ID (Public templates are accessible by everyone)
router.get('/templates/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const template = await prisma.template.findUnique({
            where: { id },
            select: { id: true, title: true, description: true, public: true, createdAt: true }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Allow access to public templates, or templates owned by the logged-in user
        if (template.public || (req.user && req.user.id === template.authorId)) {
            return res.json(template);
        } else {
            return res.status(403).json({ error: 'Forbidden' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
