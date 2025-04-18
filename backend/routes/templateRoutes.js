const { Router } = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

// Create Template (Only accessible by admins)
router.post('/createTemplate', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    console.log("🔹 Request received to create a template"); // Debug log

    const { title, description, isPublic, topic, tags, image } = req.body;  // Destructure new fields
    console.log("🔹 Request body:", req.body); // Debug log

    // Validate input
    if (!title || !description || !topic || !tags) {  // Only validate the essential fields for now
        console.log("❌ Missing required fields");
        return res.status(400).json({ error: 'Title, description, topic, and tags are required' });
    }
    try {
        console.log("🔹 Admin ID:", req.user.id); // Debug log

        // Create a new template with the new fields
        const newTemplate = await prisma.template.create({
            data: {
                title,
                description,
                isPublic: isPublic !== undefined ? isPublic : false,  // Default to false if not provided
                topic,  // Add the topic
                tags,
                image: image || null,  // Make image optional, default to null if not provided
                authorId: req.user.id,  // Ensure this is the correct user ID
            },
        });

        console.log("✅ Template created successfully:", newTemplate);
        return res.json({ message: 'Template created successfully', template: newTemplate });

    } catch (error) {
        console.error('❌ Error creating template:', error);
        return res.status(500).json({ error: 'Something went wrong while creating the template' });
    }
});


// Get All Templates (For admins, creators, and users)
router.get('/templates', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { topic } = req.query;

    try {
        const query = {
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                isPublic: true,
                topic: true,

            },
        };

        // Admin: get everything, apply topic filter if exists
        if (userRole === 'ADMIN') {
            const adminWhere = topic ? { topic } : {};
            const templates = await prisma.template.findMany({
                where: adminWhere,
                select: query.select,
            });
            return res.json(templates);
        }

        // Regular user: see public templates + own templates (even if private)
        if (userRole === 'USER') {
            const whereClause = {
                OR: [
                    { isPublic: true },
                    { authorId: userId },
                ],
            };

            if (topic) {
                whereClause.AND = [{ topic }];
            }

            const templates = await prisma.template.findMany({
                where: whereClause,
                select: query.select,
            });

            return res.json(templates);
        }

        // Just in case we somehow fall through
        return res.status(403).json({ error: 'Unauthorized access' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


// Get Public Templates (accessible without login)
router.get('/public/templates', async (req, res) => {
    const { topic } = req.query;

    try {
        const whereClause = {
            isPublic: true,
        };

        if (topic) {
            whereClause.topic = topic;
        }

        const templates = await prisma.template.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                isPublic: true,
                topic: true,
            },
        });

        return res.json(templates);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong while fetching public templates' });
    }
});



// Get a template and its questions + answers + userIds via forms
router.get('/templates/:id/full', async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
  
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
  
    try {
        const template = await prisma.template.findUnique({
            where: { id: templateId },
            select: {
              id: true,
              title: true,
              description: true,
              isPublic: true,
              image: true,
              createdAt: true,
              authorId: true,
              questions: {
                select: {
                  id: true,
                  text: true,
                  type: true,
                  answers: {
                    select: {
                      id: true,
                      response: true,
                      questionId: true,
                      formId: true,
                      form: {
                        select: {
                          userId: true,
                          user: {
                            select: {
                              id: true,
                              name: true,
                              email: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              comments: {
                select: {
                  id: true,
                  text: true,
                  createdAt: true,
                  userId: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              likes: {
                select: {
                  userId: true, // 👈 this is key
                },
              },
            },
          });
          
  
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
  
      return res.json(template);
    } catch (error) {
      console.error("❌ Error fetching template with questions and answers:", error);
      return res.status(500).json({ error: 'Server error while retrieving template details' });
    }
  });
  






router.put('/templates/:id', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
    const { title, description, isPublic, topic } = req.body;

    if (!title || !description || !topic) {
        return res.status(400).json({ error: 'Title, description, and topic are required' });
    }

    try {
        const template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check if user is the owner or an admin
        if (template.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You are not allowed to edit this template' });
        }

        const updatedTemplate = await prisma.template.update({
            where: { id: templateId },
            data: {
                title,
                description,
                isPublic: isPublic !== undefined ? isPublic : template.isPublic,
                topic,
            },
        });

        return res.json({ message: 'Template updated successfully', template: updatedTemplate });
    } catch (error) {
        console.error('❌ Error updating template:', error);
        return res.status(500).json({ error: 'Something went wrong while updating the template' });
    }
});


// POST /templates/:id/comments - Add a comment
router.post('/templates/:id/comments', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const { text } = req.body; // changed from content
    const templateId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                text, // now matches variable name
                userId,
                templateId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return res.status(201).json(comment);
    } catch (error) {
        console.error('❌ Error creating comment:', error);
        return res.status(500).json({ error: 'Could not add comment' });
    }
});


// GET /templates/:id/comments - Get all comments for a template
router.get('/templates/:id/comments', async (req, res) => {
    const templateId = parseInt(req.params.id, 10);

    try {
        const comments = await prisma.comment.findMany({
            where: { templateId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(comments);
    } catch (error) {
        console.error('❌ Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});


// POST /templates/:id/like - Like a template
router.post('/templates/:id/like', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
    const userId = req.user.id;
  
    try {
      const existing = await prisma.like.findFirst({
        where: {
          templateId,
          userId,
        },
      });
  
      if (existing) {
        return res.status(400).json({ error: 'Template already liked' });
      }
  
      const like = await prisma.like.create({
        data: {
          templateId,
          userId,
        },
      });
  
      return res.status(201).json(like);
    } catch (error) {
      console.error('❌ Error liking template:', error);
      return res.status(500).json({ error: 'Server error while liking template' });
    }
  });
  


// GET /templates/:id/likes - Get total likes
router.get('/templates/:id/likes', async (req, res) => {
    const templateId = parseInt(req.params.id, 10);

    try {
        const count = await prisma.like.count({
            where: { templateId },
        });

        res.json({ templateId, likes: count });
    } catch (error) {
        console.error('❌ Error fetching like count:', error);
        res.status(500).json({ error: 'Failed to get likes' });
    }
});


// DELETE /templates/:id/like - Unlike a template
router.delete('/templates/:id/like', authMiddleware('USER', 'ADMIN'), async (req, res) => {
    const templateId = parseInt(req.params.id, 10);
    const userId = req.user.id;
  
    try {
      const existing = await prisma.like.findFirst({
        where: {
          templateId,
          userId,
        },
      });
  
      if (!existing) {
        return res.status(404).json({ error: 'Like not found' });
      }
  
      await prisma.like.delete({
        where: { id: existing.id },
      });
  
      return res.status(200).json({ message: 'Like removed' });
    } catch (error) {
      console.error('❌ Error removing like:', error);
      return res.status(500).json({ error: 'Server error while removing like' });
    }
  });
  
  








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


