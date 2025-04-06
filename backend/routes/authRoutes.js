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
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER' // Default role is USER
            },
        });

        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
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
            { id: user.id, email: user.email, role: user.role },
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
router.get('/profile', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true }
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
            select: { id: true, name: true, email: true }
        });

        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Route for Admins to Promote Users
router.put('/promote/:userId', authMiddleware('ADMIN'), async (req, res) => {
    try {
        // Log the admin trying to promote a user
        console.log("Admin trying to promote user:", req.user);  // Debug log

        const userId = parseInt(req.params.userId, 10);  // Parse user ID from URL param
        console.log("User ID to promote:", userId);  // Debug log

        // Find the user to be promoted using Prisma
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        // If the user does not exist, return an error
        if (!user) {
            console.log("User not found.");  // Debug log
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user is already an admin (to prevent redundant promotion)
        if (user.role === 'ADMIN') {
            return res.status(400).json({ error: 'User is already an admin' });
        }

        // Update the user role to ADMIN
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' },
        });

        // Log success and return response
        console.log("User promoted successfully!");  // Debug log
        return res.json({ message: 'User has been promoted to ADMIN' });
    } catch (error) {
        console.error("Error promoting user:", error);  // Log any errors that occur
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
