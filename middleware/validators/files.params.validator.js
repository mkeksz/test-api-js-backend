const fs = require('fs');
const path = require('path');
const logger = require('../../services/logger')(module);

module.exports = {
  addCompanyImage,
  removeCompanyImage,
};

async function addCompanyImage(req, res, next) {
  try {
    if (!req?.files?.file?.[0]) {
      res.status(400);
      throw new Error('No file for upload passed');
    }

    if (!req?.params?.id) {
      res.status(400);
      throw new Error('No company ID passed for file upload');
    }

    const company = await res.app.databaseManager.company.getById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error(`No company with ID ${req.params.id}`);
    }

    const file = req.files.file[0];
    const fileExtention = path.extname(file.originalname).toLowerCase();
    const tempFilePath = file.path;

    if (!(fileExtention === '.png' || fileExtention === '.jpg' || fileExtention === '.jpeg' || fileExtention === '.gif')) {
      _remove(tempFilePath).catch((err) => { logger.error(err); });
      res.status(400);
      throw new Error('Only image files are allowed');
    }
  } catch (error) {
    const stringError = error.toString();
    logger.error(stringError);
    return res.json({ stringError });
  }

  return next();
}

async function removeCompanyImage(req, res, next) {
  try {
    if (!req?.params?.id) {
      res.status(400);
      throw new Error('No company ID passed');
    }
    if (!req?.params?.image_name) {
      res.status(400);
      throw new Error('No image name passed');
    }
    const company = await res.app.databaseManager.company.getById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error(`No company with ID ${req.params.id}`);
    }
    const photo = await res.app.databaseManager.photo.getByName(req.params.image_name);
    if (!photo) {
      res.status(404);
      throw new Error(`Image with name ${req.params.image_name} not found`);
    }
  } catch (_error) {
    const { message } = _error;
    logger.error(message);
    return res.json({ message });
  }

  return next();
}

async function _remove(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
