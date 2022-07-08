const httpContext = require('express-http-context');
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');

const httpContextConfigger = require('./middleware/httpContextConfigger.middleware');

const companiesRouter = require('./routes/companies.routes');
const contactsRouter = require('./routes/contacts.routes');
const indexRouter = require('./routes/index.routes');
const authRouter = require('./routes/auth.routes');

const DatabaseManager = require('./services/database/DatabaseManager');

const app = express();

const databaseClient = new PrismaClient();
app.databaseManager = new DatabaseManager(databaseClient);

app.use(httpContext.middleware);
app.use(httpContextConfigger);

app.use(cors());
app.use(express.static(`${__dirname}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/companies', companiesRouter);
app.use('/contacts', contactsRouter);
app.use('/', indexRouter);

module.exports = app;
