const express = require('express');
const router = express.Router();

router.use(require('./createTemplate'));
router.use(require('./allowUser'));
router.use(require('./fetchTemplates'));
router.use(require('./comments'));
router.use(require('./likes'));
router.use(require('./visibility'));

module.exports = router;
