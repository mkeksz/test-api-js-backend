const { PrismaClientValidationError } = require('@prisma/client');
const logger = require('../services/logger')(module);

module.exports = {
  get,
  update,
  post,
  del,
};

async function get(req, res) {
  const contactId = req.params.id;

  let contact;
  try {
    contact = await res.app.databaseManager.contact.getById(contactId);
  } catch (error) {
    if (error?.code === 'P2023') {
      logger.error('Invalid ID');
      return res.sendStatus(404);
    }
  }

  if (!contact) {
    logger.error('Not found');
    return res.sendStatus(404);
  }

  return res.status(200).json(contact);
}

async function update(req, res) {
  const contactId = req.params.id;
  try {
    const updatedContact = await res.app.databaseManager.contact.updateById(contactId, req.body);
    return res.status(200).json(updatedContact);
  } catch (error) {
    if (error?.code === 'P2023') {
      logger.error('Invalid ID');
      return res.sendStatus(404);
    }
    if (error instanceof PrismaClientValidationError) {
      logger.error('Invalid data');
      return res.status(400).json({ error: 'Invalid data' });
    }
    throw error;
  }
}

async function post(req, res) {
  try {
    const contact = await res.app.databaseManager.contact.create(req.body);
    res.status(200).json(contact);
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      logger.error('Invalid data');
      res.status(400).json({ error: 'Invalid data' });
    }
  }
}

async function del(req, res) {
  const contactId = req.params.id;
  try {
    await res.app.databaseManager.contact.deleteById(contactId);
  } catch (error) {
    if (error?.code === 'P2025') {
      logger.error('Not found');
      return res.sendStatus(404);
    }
    if (error?.code === 'P2023') {
      logger.error('Invalid ID');
      return res.sendStatus(404);
    }
    throw error;
  }
  return res.sendStatus(200);
}
