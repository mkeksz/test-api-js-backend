const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

router.get('/', authController.get);

module.exports = router;
