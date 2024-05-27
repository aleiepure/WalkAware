var express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require("cookie-parser")
const methodOverride = require('method-override');
require('dotenv').config();

const userRoutes = require("./routes/user_routes.js");
const aziendeRoutes = require('./routes/aziende.js');
const segnalazioniRoutes = require('./routes/segnalazioni.js');
const { tokenChecker, verifyToken } = require("./auth/tokenChecker.js");


// creating app 
var app = express();

// parsing settings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//method override
app.use(methodOverride('_method'));


// cookie parser
app.use(cookieParser());

// cors settings
app.use(cors());

// Logging middleware
app.use(morgan('dev'));

// Serving static files
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Set ejs as engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// app.use(multer)



// Routes
app.use('/utente', userRoutes);
app.use("/aziende", aziendeRoutes);
app.use("/segnalazioni", segnalazioniRoutes);

// tokenchecker for auth
app.use(tokenChecker);


// Route for the login pag
app.get('/', (req, res) => {
    if (verifyToken(req.cookies)) {
        res.redirect('segnalazioni');
    } else {
        res.render('login', { currentPage: 'login' });
    }
});



// Route registrer web user
app.get('/registrazione', (req, res) => {
    res.render('registrazione', { currentPage: 'registrazione' });
});



// Route page not found
app.get('*', (req, res) => {
    res.render('404', {currentPage: '404'});
});

// Run the application on port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



