const app = require('./app');
const mongoose = require('mongoose');



const port = process.env.PORT || 8080;



app.locals.db = mongoose.connect(process.env.MONGODB_URI)
    .then(() => {

        console.log("Connected to Database");

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });

    });
