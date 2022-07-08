const request = require('supertest');
const fs = require('fs');
const config = require('../conf');

async function getAuthHeader(app) {
  const res = await request(app).get('/auth?user=admin&password=1234');
  const token = res.header.authorization?.split(' ')[1];
  return `Bearer ${token}`;
}

async function setAuth(app, req, invalid = false) {
  if (invalid) req.set('Authorization', 'Bearer 1.1.1');
  else req.set('Authorization', await getAuthHeader(app));
}

async function createCompany(app, data = {}) {
  return app.databaseManager.company.create({
    name: 'Company 1',
    shortName: 'C1',
    businessEntity: 'ООО',
    address: 'Moscow',
    contract: { no: '123', issue_date: new Date().toISOString() },
    type: ['agent'],
    ...data,
  });
}

async function createContact(app, data = {}) {
  return app.databaseManager.contact.create({
    lastname: 'Григорьев',
    firstname: 'Сергей',
    patronymic: 'Петрович',
    phone: '79162165588',
    email: 'grigoriev@funeral.com',
    ...data,
  });
}

async function createImage(app, companyId) {
  const photo = await app.databaseManager.photo.create('test.jpg', companyId);
  fs.writeFileSync(`${__dirname}/../${config.images_dir}test.jpg`, 'test1');
  fs.writeFileSync(`${__dirname}/../${config.images_dir}test_${config.thumb_size}x${config.thumb_size}.jpg`, 'test2');
  return photo;
}

function pushCreatedImagesToArray(array, body) {
  const [name, ext] = body.name.split('.');
  array.push(body.name);
  array.push(`${name}_${config.thumb_size}x${config.thumb_size}.${ext}`);
}

module.exports = (app) => ({
  setAuth: (req, invalid = false) => setAuth(app, req, invalid),
  createCompany: (data = {}) => createCompany(app, data),
  pushCreatedImagesToArray,
  createImage: (companyId) => createImage(app, companyId),
  createContact: (data = {}) => createContact(app, data),
});
