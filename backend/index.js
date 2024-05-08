var express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const morgan = require('morgan');
const mongoose = require("mongoose");
const formData = require('express-form-data')

require('dotenv').config();

const utenteMobile = require('./routes/utente_mobile.js');
const utenteWeb = require('./routes/utente_web.js');
const segnalazioni = require('./routes/segnalazioni.js');
const aziende = require('./routes/aziende.js');




// Express settings
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

// Swagger configuration
const swaggerDocument = yaml.load('./oas3.yml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

// Middlewares
//app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/utente/mobile', utenteMobile);
app.use('/api/v1/utente/web', utenteWeb);
app.use('/api/v1/segnalazioni', segnalazioni);
app.use('/api/v1/aziende', aziende);

// MongoDB connection
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName=WalkAware`)
    .then(() => { console.log("Connected to DB"); })
    .catch((error) => { console.log("Connection to DB failed: " + error + "\n") });

// Run the application on port 8080
app.listen(8080, function () {
    console.log('Server running on port ', 8080);
});


