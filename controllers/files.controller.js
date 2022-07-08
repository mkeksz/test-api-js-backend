const crypto = require('crypto');
const fs = require('fs');
const jimp = require('jimp');
const path = require('path');
const { getFileURL } = require('../shared/url');

const config = require('../conf');
const logger = require('../services/logger')(module);

const thumbSize = config.thumb_size;

module.exports = {
  saveImage,
  removeImage,
};

async function saveImage(req, res) {
  try {
    logger.info('File upload started');
    const file = req.files.file[0];

    const fileExtention = path.extname(file.originalname).toLowerCase();
    const fileName = crypto.randomBytes(10).toString('hex');

    const uploadedFileName = fileName + fileExtention;
    const uploadedFileThumbName = `${fileName}_${thumbSize}x${thumbSize}${fileExtention}`;

    const tempFilePath = file.path;
    const targetFilePath = path.resolve(`${config.images_dir}/${uploadedFileName}`);
    const targetThumbPath = path.resolve(`${config.images_dir}/${uploadedFileThumbName}`);

    await _resize(tempFilePath, targetThumbPath);
    await _rename(tempFilePath, targetFilePath);

    logger.info('File upload successfully finished');

    await res.app.databaseManager.photo.create(uploadedFileName, req.params.id);

    return res.status(200).json({
      name: uploadedFileName,
      filepath: getFileURL(req, uploadedFileName),
      thumbpath: getFileURL(req, uploadedFileThumbName),
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error });
  }
}

async function removeImage(req, res) {
  try {
    const fileName = req.params.image_name;

    await res.app.databaseManager.photo.deleteByName(fileName);

    const filePath = path.resolve(`${config.images_dir}/${fileName}`);
    await _remove(filePath).catch((err) => { logger.error(err); });

    const fileExtention = path.extname(fileName).toLowerCase();
    const _fileName = fileName.split('.').slice(0, -1).join('.');
    const thumbName = `${_fileName}_${thumbSize}x${thumbSize}${fileExtention}`;
    const thumbPath = path.resolve(`${config.images_dir}/${thumbName}`);
    await _remove(thumbPath).catch((err) => { logger.error(err); });

    return res.status(200).end();
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error });
  }
}

async function _rename(temp, target) {
  return new Promise((resolve, reject) => {
    fs.rename(temp, target, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function _resize(file, filePath) {
  const image = await jimp.read(file);
  await image.resize(jimp.AUTO, 180);
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  await image.crop((w - thumbSize) / 2, (h - thumbSize) / 2, thumbSize, thumbSize);
  await image.writeAsync(filePath);
}

async function _remove(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
