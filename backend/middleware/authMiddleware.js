const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const authMiddleware = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ message: "No token provided" });
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("✅ Decoded JWT:", decoded);

            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            console.log("✅ User from DB:", user);
            req.user = user;

            let bypassRoleCheck = false;

            const id = parseInt(req.params.id);
            const templateId = parseInt(req.params.templateId || id);
            const questionId = parseInt(req.params.questionId || id);

            // ✅ Ensure valid template lookup before role check
            if (!isNaN(templateId)) {
                const template = await prisma.template.findUnique({
                    where: { id: templateId },
                });

                if (template) {
                    if (template.authorId === user.id) {
                        bypassRoleCheck = true;
                        console.log("✅ User is the author of this template.");
                    }
                } else {
                    console.warn("⚠️ Template not found for ID:", templateId);
                }
            }

            if (!bypassRoleCheck && req.originalUrl.includes("/questions/") && !isNaN(questionId)) {
                const question = await prisma.question.findUnique({
                    where: { id: questionId },
                    select: {
                        template: {
                            select: {
                                authorId: true,
                            },
                        },
                    },
                });

                if (question?.template?.authorId === user.id) {
                    bypassRoleCheck = true;
                    console.log("✅ User owns the template that this question belongs to.");
                }
            }

            if (!bypassRoleCheck && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: "Forbidden: Insufficient rights" });
            }

            next();
        } catch (err) {
            console.error("❌ Auth Middleware Error:", err);
            res.status(401).json({ message: "Invalid or expired token" });
        }
    };
};

module.exports = authMiddleware;
