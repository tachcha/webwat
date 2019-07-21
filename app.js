import createError from "http-errors";
import express from "express";
import session from "express-session";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import {
  homeRouter,
  authRouter,
  userRouter,
  adminRouter,
  apiRouter
} from "./routes";
import config from "./config";
import csrfToken from "csurf";
import flash from "express-flash";

var app = express();

app.use(
  session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {}
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//app.use(csrfToken);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(flash());

app.use(function(req, res, next) {
  res.locals.auth = req.session.auth;
  next();
});

const adminOnlyMiddleware = (req, res, next) => {
  if (!req.session.auth) {
    return res.redirect("/auth/logout");
  }
  next();
};

//routes
app.use("/", homeRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/admin", adminOnlyMiddleware, adminRouter);
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
