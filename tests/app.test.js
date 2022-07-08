process.env.AUTH_USERNAME = 'admin';
process.env.AUTH_PASSWORD = '1234';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const assert = require('assert');
const fs = require('fs');
const config = require('../conf');
const app = require('../app');
const {
  setAuth, createCompany, pushCreatedImagesToArray, createImage, createContact,
} = require('./helpers')(app);

beforeEach(() => app.databaseManager.deleteAllData());
afterEach(() => app.databaseManager.deleteAllData());

describe('GET /', () => {
  it('should return status 200', (done) => {
    request(app).get('/').expect(200).end(done);
  });
});

describe('GET /auth', () => {
  it('should return status 400 if the username or password is not correct', async () => {
    await request(app).get('/auth?user=admiin&password=1234').expect(400);
    await request(app).get('/auth?user=admin&password=12344').expect(400);
    await request(app).get('/auth?user=admsinn&password=1234434').expect(400);
    return true;
  });
  it('should return status 200 if the username and password is correct', (done) => {
    request(app).get('/auth?user=admin&password=1234')
      .expect(200)
      .end(done);
  });
  it('should return the Bearer Authorization token if the username and password is correct', (done) => {
    request(app).get('/auth?user=admin&password=1234')
      .expect((res) => assert.match(res.header.authorization, /^Bearer (\S+\.\S+\.\S+)$/))
      .end(done);
  });
});

describe('GET /companies/:id', () => {
  let req;
  let targetCompany;

  beforeEach(async () => {
    targetCompany = await createCompany();
    req = request(app).get(`/companies/${targetCompany.id}`);
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return a company object', async () => {
    const result = await req.expect(200);
    assert.strictEqual(result.body.id, targetCompany.id);
  });

  it('should return status 404 if the company does not exist', async () => {
    const _req = request(app).get('/companies/123');
    await setAuth(_req);
    _req.expect(404);
  });
});

describe('DELETE /companies/:id', () => {
  let req;
  let targetCompany;

  beforeEach(async () => {
    targetCompany = await createCompany();
    req = request(app).delete(`/companies/${targetCompany.id}`);
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return status 404 if the company does not exist', async () => {
    const _req = request(app).delete('/companies/123');
    await setAuth(_req);
    _req.expect(404);
  });

  it('should delete the company', async () => {
    await req.expect(200);
    const result = await app.databaseManager.company.getById(targetCompany.id);
    assert.strictEqual(result, null);
  });
});

describe('PUT /companies/:id', () => {
  let req;
  let targetCompany;

  beforeEach(async () => {
    targetCompany = await createCompany();
    req = request(app).put(`/companies/${targetCompany.id}`);
    req.send({ name: 'new name' });
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return status 404 if the company does not exist', async () => {
    const _req = request(app).put('/companies/123');
    await setAuth(_req);
    _req.expect(404);
  });

  it('should return status 400 if data is invalid', async () => {
    req.send({ type: 'invalid' });
    await req.expect(400);
  });

  it('should return new company object', async () => {
    const result = await req.expect(200);
    assert.strictEqual(result.body.name, 'new name');
  });
});

describe('POST /companies', () => {
  let req;

  beforeEach(async () => {
    req = request(app).post('/companies');
    req.send({
      name: 'Company 2',
      shortName: 'C2',
      businessEntity: 'ООО',
      address: 'Moscow',
      contract: { no: '123', issue_date: new Date().toISOString() },
      type: ['agent'],
    });
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return status 400 if data is invalid', async () => {
    req.send({ type: 'invalid' });
    await req.expect(400);
  });

  it('should return a created company object', async () => {
    const result = await req.expect(200);
    assert.strictEqual(result.body.name, 'Company 2');
  });
});

describe('GET /companies', () => {
  let req;

  beforeEach(async () => {
    await createCompany({ name: 'A' });
    await createCompany({ name: 'B' });
    await createCompany({ name: 'C' });
    await createCompany({ name: 'D', status: 'inactive', type: ['contractor'] });
    await createCompany({ name: 'E', status: 'inactive' });
    req = request(app).get('/companies');
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return a companies array', async () => {
    const result = await req.expect(200);
    assert.strictEqual(result.body[0].name, 'A');
    assert.strictEqual(result.body[1].name, 'B');
  });

  it('should return a companies array with page', async () => {
    const _req = request(app).get('/companies?page=1');
    await setAuth(_req);
    const result = await _req.expect(200);
    assert.strictEqual(result.body.length, 3);

    const _req2 = request(app).get('/companies?page=2');
    await setAuth(_req2);
    const result2 = await _req2.expect(200);
    assert.strictEqual(result2.body.length, 2);
  });

  it('should return a companies array with filter', async () => {
    const _req = request(app).get('/companies?filter={"status":"inactive"}');
    await setAuth(_req);
    const result = await _req.expect(200);
    assert.strictEqual(result.body.length, 2);

    const _req2 = request(app).get('/companies?filter={"status":"inactive","type":"contractor"}');
    await setAuth(_req2);
    const result2 = await _req2.expect(200);
    assert.strictEqual(result2.body.length, 1);
  });

  it('should return a companies array with sort name', async () => {
    const _req = request(app).get('/companies?sort={"name":"desc"}');
    await setAuth(_req);
    const result = await _req.expect(200);
    assert.strictEqual(result.body[0].name, 'E');
    assert.strictEqual(result.body[1].name, 'D');
  });

  it('should return a companies array with sort createdAt', async () => {
    const _req = request(app).get('/companies?sort={"createdAt":"desc"}');
    await setAuth(_req);
    const result = await _req.expect(200);
    assert.strictEqual(result.body[0].name, 'E');
    assert.strictEqual(result.body[1].name, 'D');
  });
});

describe('POST /companies/:id/image', () => {
  let targetCompany;
  let req;
  let image;
  let createdFiles = [];

  beforeEach(async () => {
    createdFiles = [];
    targetCompany = await createCompany();
    req = request(app).post(`/companies/${targetCompany.id}/image`);
    await setAuth(req);
    image = fs.readFileSync(`${__dirname}/images/valid-image.jpg`);
  });

  afterEach(() => {
    createdFiles.forEach((file) => fs.unlinkSync(`${__dirname}/../${config.images_dir}${file}`));
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  }).timeout(5000);

  it('should return status 200 if the Authorization token is valid', async () => {
    req.attach('file', image, 'valid-image.jpg');
    const result = await req.expect(200);
    pushCreatedImagesToArray(createdFiles, result.body);
  }).timeout(5000);

  it('should return 404 if the company does not exist', async () => {
    const _req = request(app).get('/companies/123/image');
    await setAuth(_req);
    req.attach('file', image, 'valid-image.jpg');
    await _req.expect(404);
  }).timeout(5000);

  it('should return 400 if the image is invalid', async () => {
    const _image = fs.readFileSync(`${__dirname}/images/invalid.txt`);
    req.attach('file', _image, 'invalid.txt');
    await req.expect(400);
  }).timeout(5000);

  it('should return an image object', async () => {
    req.attach('file', image, 'valid-image.jpg');
    const result = await req.expect(200);
    assert.strictEqual(typeof result.body.name, 'string');
    assert.strictEqual(typeof result.body.filepath, 'string');
    assert.strictEqual(typeof result.body.thumbpath, 'string');
    pushCreatedImagesToArray(createdFiles, result.body);
  }).timeout(5000);

  it('should create the image files', async () => {
    req.attach('file', image, 'valid-image.jpg');
    const result = await req.expect(200);
    const filename = result.body.name;
    const [name, ext] = filename.split('.');

    const file = await fs.readFileSync(`${__dirname}/../${config.images_dir}${filename}`);
    assert.strictEqual(Buffer.isBuffer(file), true);

    const file2 = await fs.readFileSync(`${__dirname}/../${config.images_dir}${name}_${config.thumb_size}x${config.thumb_size}.${ext}`);
    assert.strictEqual(Buffer.isBuffer(file2), true);

    pushCreatedImagesToArray(createdFiles, result.body);
  }).timeout(5000);
});

describe('DELETE /companies/:id/image/:image_name', () => {
  let req;
  let targetCompany;
  let targetPhoto;
  let createdFiles = [];

  beforeEach(async () => {
    createdFiles = [];
    targetCompany = await createCompany();
    targetPhoto = await createImage(targetCompany.id);
    req = request(app).delete(`/companies/${targetCompany.id}/image/${targetPhoto.name}`);
    createdFiles.push('test.jpg');
    createdFiles.push(`test_${config.thumb_size}x${config.thumb_size}.jpg`);
    await setAuth(req);
  });

  afterEach(async () => {
    createdFiles.forEach((file) => {
      try {
        fs.unlinkSync(`${__dirname}/../${config.images_dir}${file}`);
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    });
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return 404 if the company does not exist', async () => {
    const _req = request(app).get('/companies/123/image/test.jpg');
    await setAuth(_req);
    await _req.expect(404);
  });

  it('should return 404 if the image does not exist', async () => {
    const _req = request(app).get(`/companies/${targetCompany.id}/image/invalid.jpg`);
    await setAuth(_req);
    await _req.expect(404);
  });

  it('should delete the image files', async () => {
    await req.expect(200);
    createdFiles.forEach((file) => {
      assert.strictEqual(fs.existsSync(`${__dirname}/../${config.images_dir}${file}`), false);
    });
  });
});

describe('GET /contacts/:id', () => {
  let req;
  let targetContact;

  beforeEach(async () => {
    targetContact = await createContact();
    req = request(app).get(`/contacts/${targetContact.id}`);
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return a contact object', async () => {
    const result = await req.expect(200);
    assert.strictEqual(result.body.id, targetContact.id);
  });

  it('should return 404 if the contact does not exist', async () => {
    const _req = request(app).get('/contacts/123');
    await setAuth(_req);
    await _req.expect(404);
  });
});

describe('PUT /contacts/:id', () => {
  let req;
  let targetContact;

  beforeEach(async () => {
    targetContact = await createContact();
    req = request(app).put(`/contacts/${targetContact.id}`);
    req.send({ name: 'test' });
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return status 404 if the contact does not exist', async () => {
    const _req = request(app).put('/contacts/123');
    await setAuth(_req);
    await _req.expect(404);
  });

  it('should return status 400 if the data is invalid', async () => {
    req.send({ firstname: ['object'] });
    await req.expect(400);
  });

  it('should return a contact object', async () => {
    const result = await req.expect(200);
    assert.strictEqual(result.body.firstname, 'Сергей');
  });
});

describe('POST /contacts', () => {
  let req;

  beforeEach(async () => {
    req = request(app).post('/contacts');
    req.send({
      lastname: 'Григорьев',
      firstname: 'Сергей',
      patronymic: 'Петрович',
      phone: '79162165588',
      email: 'grigoriev@funeral.com',
    });
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return status 400 if the data is invalid', async () => {
    req.send({ lastname: ['invalid'] });
    await req.expect(400);
  });

  it('should return a contact object', async () => {
    const result = await req.expect(200);
    assert.strictEqual(result.body.lastname, 'Григорьев');
  });
});

describe('DELETE /contacts/:id', () => {
  let req;
  let targetContact;

  beforeEach(async () => {
    targetContact = await createContact();
    req = request(app).delete(`/contacts/${targetContact.id}`);
    await setAuth(req);
  });

  it('should return status 401 if the Authorization token is invalid', async () => {
    await setAuth(req, true);
    await req.expect(401);
  });

  it('should return status 200 if the Authorization token is valid', async () => {
    await req.expect(200);
  });

  it('should return 404 if the contact does not exist', async () => {
    const _req = request(app).delete('/contacts/123');
    await setAuth(_req);
    await _req.expect(404);
  });

  it('should delete the contact', async () => {
    await req.expect(200);
    assert.strictEqual(await app.databaseManager.contact.getById(targetContact.id), null);
  });
});
