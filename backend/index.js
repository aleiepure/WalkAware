var express = require('express');
var app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const mongoose = require("mongoose");

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

// Run the application on port 3000
app.listen(3000, function () {
    console.log('Server running on port ', 3000);
});


mongoose.connect("mongodb+srv://carlottacazzolli:hgXcj0RNjICvIiyo@walkaware.ihu6bna.mongodb.net/?retryWrites=true&w=majority&appName=WalkAware")
.then(()=> {console.log("Connected to DB");})
.catch((error)=> {console.log("Connection to DB failed: "+ error +"\n")});