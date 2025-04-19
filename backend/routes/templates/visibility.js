const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

// Toggle template public/private visibility (Author or Admin only)
router.put('/templates/:id/visibility', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);

    try {
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Only the author or an admin can toggle visibility
        if (template.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You are not allowed to modify this template' });
        }

        const updatedTemplate = await prisma.template.update({
            where: { id: templateId },
            data: {
                isPublic: !template.isPublic,
            },
        });

        return res.json({ message: `Template is now ${updatedTemplate.isPublic ? 'Public' : 'Private'}` });
    } catch (error) {
        console.error('❌ Error toggling template visibility:', error);
        return res.status(500).json({ error: 'Failed to change visibility' });
    }
});

module.exports = router;
