const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");          
const logger = require("morgan");

const hbs = require("express-handlebars");
const db = require("./config/database");
const session = require("express-session");                      
const nocache = require("nocache");
const flash = require("connect-flash");  
const handlebars=require("handlebars")

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const multer = require("multer");

const app = express();

// view engine setup

app.set("views", path.join(__dirname, "views"));       
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    helpers: {inc: function (value, options) { return parseInt(value) + 1;}},             
    extname: "hbs",
    defaultLayout: false,

    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);

// for handlebar operations
handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {        
  var operators = {

    'eq': function (l, r) { return l == r; },
    'noteq': function (l, r) { return l != r; },
    'gt': function (l, r) { return Number(l) > Number(r); },
    'or': function (l, r) { return l || r; },
    'and': function (l, r) { return l && r; },
    '%': function (l, r) { return (l % r) === 0; }
  }
    , result = operators[operator](operand_1, operand_2);

  if (result) return options.fn(this);
  else return options.inverse(this);
});



app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//view_product satic page (links no access)not working problem is rectfied      
app.use('/view_product', express.static(path.join(__dirname, "public")))  
// app.use('/proceed_to_checkout', express.static(path.join(__dirname, "public"))) 
////////////
app.use(nocache());

app.use(session({ secret: "key", cookie: { maxAge: 600000000 } }));

// flash should be called after sessoin//
app.use(flash());

db.dbconnect((err) => {
  if (err) console.log("connection error" + err);
  else console.log("database connected to port 27017");
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('error', { layout: "main-layout" ,error_404:true})
  // next(createError(404));
});





// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development     

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      req.flash("error", "file size is too large"); 
      res.redirect("/admin/add_product");
    } else if (err.code === "LIMIT_FILE_COUNT") {
      req.flash("error", "you can upload maximum 3 images only");
      res.redirect("/admin/add_product");
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      req.flash("error", "unexpected file");
      res.redirect("/admin/add_product");
    }
  }

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});






module.exports = app;
