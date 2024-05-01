var express = require('express');
var app = express();
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const utenteMobile = require('./routes/utente_mobile.js');
const mongoose = require("mongoose");
require('dotenv').config();

// load YAML
const swaggerDocument = YAML.load('./oas3.yml');

// Configuration interface Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {explorer: true }));

// parsing settings
app.use(express.json()); 
app.use(express.urlencoded()); 

// cors settings
app.use(cors());

// Serving static files
app.use(express.static('public'));

// Handling GET requests
console.log(swaggerDocument);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true
}));


// routing
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use('/api/v1/utente/mobile', utenteMobile);

// db connection
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName=WalkAware`)
.then(()=> {console.log("Connected to DB");})
.catch((error)=> {console.log("Connection to DB failed: "+ error +"\n")});

// Run the application on port 3000
app.listen(3000, function () {
    console.log('Server running on port ', 3000);
});


