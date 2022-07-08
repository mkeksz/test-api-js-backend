const BaseDatabaseService = require('../BaseDatabaseService');

class ContactService extends BaseDatabaseService {
  getById(id) {
    return this.database.contact.findUnique({ where: { id } });
  }

  updateById(id, data) {
    return this.database.contact.update({
      where: { id },
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        patronymic: data.patronymic,
        phone: data.phone,
        email: data.email,
      },
    });
  }

  create(data) {
    return this.database.contact.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        patronymic: data.patronymic,
        phone: data.phone,
        email: data.email,
      },
    });
  }

  async deleteById(id) {
    await this.database.contact.delete({ where: { id } });
  }

  async deleteAll() {
    await this.database.contact.deleteMany({});
  }
}

module.exports = ContactService;
