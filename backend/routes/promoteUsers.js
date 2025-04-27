const { Router } = require('express');
const prisma = require('../prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();



router.post('/promoteUser', authMiddleware('ADMIN'), async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' }
        });

        res.status(200).json({ success: true, message: `User ${updatedUser.email} has been promoted to ADMIN.` });
    } catch (error) {
        console.error('Error promoting user:', error);
        res.status(500).json({ error: 'Failed to promote user' });
    }
});


router.get('/allUsers', authMiddleware('ADMIN'), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// SELF-DEMOTE (admin can demote themselves)
router.post('/selfDemote', authMiddleware('ADMIN'), async (req, res) => {
    try {
        const userId = req.user.id; // Get the logged-in user's ID from authMiddleware

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'ADMIN') {
            return res.status(400).json({ error: 'You are not an admin.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' },
        });

        res.status(200).json({ success: true, message: `You have been demoted to USER.` });
    } catch (error) {
        console.error('Error self-demoting:', error);
        res.status(500).json({ error: 'Failed to self-demote' });
    }
});





// DEMOTE another user from ADMIN to USER
router.post('/demoteUser', authMiddleware('ADMIN'), async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'ADMIN') {
            return res.status(400).json({ error: 'User is not an admin' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' },
        });

        res.status(200).json({ success: true, message: `User ${updatedUser.email} has been demoted to USER.` });
    } catch (error) {
        console.error('Error demoting user:', error);
        res.status(500).json({ error: 'Failed to demote user' });
    }
});





// DELETE a user (Admin only)
router.delete('/deleteUser/:id', authMiddleware('ADMIN'), async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await prisma.user.delete({ where: { id: userId } });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});




module.exports = router;
