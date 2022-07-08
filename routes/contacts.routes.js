const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');
const contactsController = require('../controllers/contacts.controller');

router.use(auth);

router.get('/:id', contactsController.get);
router.put('/:id', contactsController.update);
router.delete('/:id', contactsController.del);
router.post('/', contactsController.post);

module.exports = router;
