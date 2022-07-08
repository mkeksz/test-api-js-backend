const CompanyService = require('./Company');
const ContactService = require('./Contact');
const PhotoService = require('./Photo');

class ServiceManager {
  constructor(database) {
    this.company = new CompanyService(database);
    this.photo = new PhotoService(database);
    this.contact = new ContactService(database);
  }

  async deleteAllData() {
    await this.company.deleteAll();
    await this.photo.deleteAll();
    await this.contact.deleteAll();
  }
}

module.exports = ServiceManager;
