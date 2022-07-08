const BaseDatabaseService = require('../BaseDatabaseService');

class CompanyService extends BaseDatabaseService {
  getById(id) {
    return this.database.company.findUnique({
      where: { id },
      include: { photos: true },
    });
  }

  async deleteById(id) {
    await this.database.company.update({
      where: { id },
      data: { photos: { deleteMany: {} } },
    });
    await this.database.company.delete({ where: { id } });
  }

  updateById(id, data) {
    return this.database.company.update({
      where: { id },
      data: {
        name: data.name,
        shortName: data.shortName,
        businessEntity: data.businessEntity,
        address: data.address,
        contract: data.contract,
        type: data.type,
        status: data.status,
        ..._getContactQuery(data.contactId),
      },
      include: { photos: true },
    });
  }

  create(data) {
    return this.database.company.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        businessEntity: data.businessEntity,
        address: data.address,
        contract: data.contract,
        type: data.type,
        status: data.status,
        ..._getContactQuery(data.contactId),
      },
      include: { photos: true },
    });
  }

  getAll(offset, limit, filter, sort) {
    let orderBy = [];
    if (sort.name) orderBy.push({ name: sort.name });
    if (sort.createdAt) orderBy.push({ createdAt: sort.createdAt });
    if (orderBy.length === 0) orderBy = undefined;

    const filterStatus = filter?.status ? filter.status : undefined;
    const filterType = filter?.type ? { has: filter.type } : undefined;

    return this.database.company.findMany({
      skip: offset,
      take: limit,
      where: {
        status: filterStatus,
        type: filterType,
      },
      include: { photos: true },
      orderBy,
    });
  }

  async deleteAll() {
    await this.database.company.deleteMany({});
  }
}

function _getContactQuery(contactId) {
  let contactQuery;
  if (contactId === '') contactQuery = { contactId: null };
  else if (contactId === undefined) contactQuery = { contactId: undefined };
  else contactQuery = { contact: { connect: { id: contactId } } };
  return contactQuery;
}

module.exports = CompanyService;
