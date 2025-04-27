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




module.exports = router;
