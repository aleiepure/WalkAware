const app = require('./app');
const mongoose = require('mongoose');

const port = process.env.PORT || 8080;

app.locals.db = mongoose.connect(process.env.MONGODB_URI_TEST)
    .then(() => {
        console.log("Connected to database");
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Cannot connect to the database");
    });
