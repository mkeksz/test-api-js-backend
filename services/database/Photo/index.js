const BaseDatabaseService = require('../BaseDatabaseService');

class PhotoService extends BaseDatabaseService {
  create(name, companyId) {
    return this.database.photo.create({ data: { name, companyId } });
  }

  getByName(name) {
    return this.database.photo.findUnique({ where: { name } });
  }

  async deleteByName(name) {
    await this.database.photo.delete({ where: { name } });
  }

  async deleteAll() {
    await this.database.photo.deleteMany({});
  }
}

module.exports = PhotoService;
