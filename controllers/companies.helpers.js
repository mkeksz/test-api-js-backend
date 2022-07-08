const config = require('../conf');

function transformCompanyDataToValid(_data) {
  const data = { ..._data };
  if (data.contract) {
    const { contract } = data;
    if (!contract.no) throw new Error('contract.no is required');
    data.contract = {
      no: String(contract.no),
      issue_date: new Date(contract.issue_date).toISOString(),
    };
  }
  if (data.type) {
    if (!Array.isArray(data.type)) throw new Error('type should be array');
  }
  return data;
}

async function updateCompanyById(req, id, data) {
  const updatedCompany = await req.app.databaseManager.company.updateById(id, data);
  const URL = _getCurrentURL(req);
  _formatCompanyPhotos(updatedCompany.photos, URL);
  return updatedCompany;
}

async function getCompanyById(req, id) {
  const company = await req.app.databaseManager.company.getById(id);
  if (!company) return null;
  const URL = _getCurrentURL(req);
  _formatCompanyPhotos(company.photos, URL);
  return company;
}

async function createCompany(req, data) {
  const company = await req.app.databaseManager.company.create(data);
  const URL = _getCurrentURL(req);
  _formatCompanyPhotos(company.photos, URL);
  return company;
}

function transformSortParamToValid(querySort) {
  let sort = querySort ? JSON.parse(querySort) : undefined;
  sort = { name: sort?.name, createdAt: sort?.createdAt };
  const isValidSortName = sort.name === 'asc' || sort.name === 'desc';
  if (!isValidSortName) sort.name = undefined;
  const isValidSortCreatedAt = sort.createdAt === 'asc' || sort.createdAt === 'desc';
  if (!isValidSortCreatedAt) sort.createdAt = undefined;
  return sort;
}

function _formatCompanyPhotos(photos, photoURL) {
  photos.forEach((photo) => {
    const [name, ext] = photo.name.split('.');
    photo.filepath = `${photoURL}${photo.name}`;
    photo.thumbpath = `${photoURL}${name}_${config.thumb_size}x${config.thumb_size}.${ext}`;
  });
}

function _getCurrentURL(req) {
  const { port } = config;
  return `${req.protocol}://${req.hostname}${String(port) === '80' || String(port) === '443' ? '' : `:${port}`}/images/`;
}

module.exports = {
  getCompanyById,
  transformDataToValid: transformCompanyDataToValid,
  updateCompanyById,
  createCompany,
  transformSortParamToValid,
};
