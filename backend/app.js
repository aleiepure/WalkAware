var express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const morgan = require('morgan');

const tokenChecker = require("./auth/tokenChecker.js");

require('dotenv').config();

const utenteMobile = require('./routes/utente_mobile.js');
const utenteWeb = require('./routes/utente_web.js');
const segnalazioni = require('./routes/segnalazioni.js');
const aziende = require('./routes/aziende.js');
const premi = require('./routes/premi.js');

// Express settings
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Swagger configuration
const swaggerDocument = yaml.load('./oas3.yml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middlewares
app.use(cors());
app.use(morgan('dev'));

app.use(tokenChecker);

// Routes
app.use('/api/v1/utente/mobile', utenteMobile);
app.use('/api/v1/utente/web', utenteWeb);
app.use('/api/v1/segnalazioni', segnalazioni)
app.use('/api/v1/aziende', aziende);
app.use('/api/v1/premi', premi);

module.exports = app;
