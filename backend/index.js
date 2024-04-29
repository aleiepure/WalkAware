var express = require('express');
var app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const utenteMobile = require('./routes/utente_mobile.js');
const mongoose = require("mongoose");
require('dotenv').config();

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hello World',
            version: '1.0.0',
        },
    },
    apis: ['./index.js', './src/routes/*.js'], // files containing annotations as above
};

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

// Serving static files
app.use(express.static('public'));

// Handling GET requests
const swaggerDocument = swaggerJsDoc(swaggerOptions);
console.log(swaggerDocument);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true
}));

/**
* @openapi
* /:
*   get:
*       description: Welcome to swagger-jsdoc!
*       responses:
*           200:
*               description: Returns a mysterious string.
*/
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use('/api/v1/utente/mobile', utenteMobile);


mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName=WalkAware`)
.then(()=> {console.log("Connected to DB");})
.catch((error)=> {console.log("Connection to DB failed: "+ error +"\n")});

// Run the application on port 3000
app.listen(3000, function () {
    console.log('Server running on port ', 3000);
});


