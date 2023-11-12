if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require(`express`)
const mongoose = require(`mongoose`)
const ejs = require(`ejs`)
const flash = require('connect-flash');
const passport = require("passport")
const session = require(`express-session`)
const methodOverride = require('method-override');
const app = express();



//CONNECTING TO THE MONGODB DATABASE
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`MongoDB connected...`))
  .catch(err => console.error(`MongoDB connection error: ${err}`));

// TO CALL OUR EJS
app.set(`view engine`, `ejs`);

//TO BE ABLE TO ACCESS OUR STATIC FILES -- IMG, CSS, VIDEOS
app.use(express.static(`public`))
app.use(express.urlencoded({ extended: false }));



app.use(session({
    secret: process.env.SESSION_SECRET,
    // means do you want to resave session iF nothing changes
    resave: false,
     //save empty value in the session
     saveUninitialized: false  
}));
app.use(flash())
//creating global variable for color changing
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});
;

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));





// ROUTES
app.use(`/`, require(`./controller/front`));
app.use(`/`, require(`./controller/back`));
app.use(`/`, require(`./controller/log`));




const port = process.env.PORT 
app.listen(port, () => console.log(`Server started on port ${port}`));






