const express = require('express');
const multer = require('multer');
const config = require('../conf');

const fileHandler = multer({ dest: config.uploads_dir });
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const companiesController = require('../controllers/companies.controller');

const filesParamsValidator = require('../middleware/validators/files.params.validator');
const filesController = require('../controllers/files.controller');

router.use(auth);

router.post(
  '/:id/image',
  fileHandler.fields([{ name: 'file', maxCount: 1 }]),
  filesParamsValidator.addCompanyImage,
  filesController.saveImage,
);

router.delete(
  '/:id/image/:image_name',
  filesParamsValidator.removeCompanyImage,
  filesController.removeImage,
);

router.get('/:id', companiesController.get);
router.delete('/:id', companiesController.del);
router.put('/:id', companiesController.update);
router.post('/', companiesController.post);
router.get('/', companiesController.getList);

module.exports = router;
