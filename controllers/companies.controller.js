const { PrismaClientValidationError } = require('@prisma/client');
const config = require('../conf');
const {
  getCompanyById, transformDataToValid, updateCompanyById, createCompany,
  transformSortParamToValid,
} = require('./companies.helpers');
const logger = require('../services/logger')(module);

module.exports = {
  get,
  update,
  del,
  post,
  getList,
};

async function get(req, res) {
  const companyId = req.params.id;

  let company;
  try {
    company = await getCompanyById(req, companyId);
  } catch (error) {
    if (error?.code === 'P2023') {
      logger.error('Invalid ID');
      return res.sendStatus(404);
    }
    throw error;
  }

  if (!company) {
    logger.error('Not found');
    return res.sendStatus(404);
  }
  return res.status(200).json(company);
}

async function update(req, res) {
  const companyId = req.params.id;

  let data;
  try {
    data = transformDataToValid(req.body);
  } catch {
    logger.error('Invalid data');
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const updatedCompany = await updateCompanyById(req, companyId, data);
    return res.status(200).json(updatedCompany);
  } catch (error) {
    if (error?.code === 'P2023') {
      logger.error('Invalid ID');
      return res.sendStatus(404);
    }
    if (error?.code === 'P2025') {
      logger.error('Not found');
      return res.sendStatus(404);
    }
    throw error;
  }
}

async function del(req, res) {
  try {
    await res.app.databaseManager.company.deleteById(req.params.id);
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

async function post(req, res) {
  let data;
  try {
    data = transformDataToValid(req.body);
  } catch {
    logger.error('Invalid data');
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const newCompany = await createCompany(req, data);
    return res.status(200).json(newCompany);
  } catch (error) {
    if (error?.code === 'P2023') {
      logger.error('Invalid ID');
      return res.sendStatus(404);
    }
    if (error?.code === 'P2025') {
      logger.error('Not found');
      return res.sendStatus(404);
    }
    if (error instanceof PrismaClientValidationError) {
      logger.error('Invalid data');
      return res.status(400).json({ error: 'Invalid data' });
    }
    throw error;
  }
}

async function getList(req, res) {
  let filter;
  try {
    filter = req.query.filter ? JSON.parse(req.query.filter) : undefined;
  } catch {
    logger.error('Invalid filter param');
    return res.status(400).json({ error: 'Invalid filter param' });
  }
  filter = filter ? { status: filter?.status, type: filter?.type } : undefined;

  let sort;
  try {
    sort = transformSortParamToValid(req.query.sort);
  } catch {
    logger.error('Invalid sort param');
    return res.status(400).json({ error: 'Invalid sort param' });
  }

  let page = Number(req.query.page) || 1;
  if (page < 1) page = 1;
  const offset = config.list_limit * (page - 1);

  try {
    const companies = await res.app.databaseManager.company
      .getAll(offset, config.list_limit, filter, sort);
    return res.status(200).json(companies);
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      logger.error('Invalid data');
      return res.status(400).json({ error: 'Invalid data' });
    }
    throw error;
  }
}
