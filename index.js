const express = require('express');
const path = require('path');
const bcrypt = require('bycrypt')
const mongoose = require('mongoose')
const session = require('express-session')
const mongodbSession = require('connect-mongodb-session')
require('dotenv').config()
const UserSchema = require('./UserSchema')

// models
const profileMod = require('./models/profileModel')

// middlewares 
const {cleanUpandValidate} = require('./utils/AuthUtils')
const isAuth = require('./middlewares/isAuth')
const rateLimitng = require('./middlewares/rateLimiting')

const app = express();

app.set('view engine', 'ejs')
app.use(express.static())


// connetion with mongoos
mongoose.set('stictQuery', false);

mongoose.connect(MONGOURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((res)=>{
    console.log("Connet to DB successfully")
}).catch((err)=>{
    console.log("Failed to Connet", err)
})


app.use(express.json()) 
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

const store = new mongodbSession({
    uri:MONOGOUR,
    collection: 'session',
})


app.use(session({
    secret:"hello backendjs",
    resave: false,
    saveUninitialized: false,
    store: store,
}))


app.get("/", (req, res) => {
    res.send("Welcome to my app");
  });
  
  app.get("/login", (req, res) => {
    return res.render("login");
  });
  
  app.get("/register", (req, res) => {
    return res.render("register");
  });
  
  app.post("/register", async (req, res) => {
    console.log(req.body);
    const { name, email, username, password } = req.body;
    try {
      await cleanUpandValidate({ name, password, email, username });
    } catch (err) {
      return res.send({
        status: 400,
        message: err,
      });
    }
  
    //bcrypt : md5
    const hashedPassword = await bcrypt.hash(password, 7);
  
    console.log(hashedPassword);
  
    let user = new UserSchema({
      name: name,
      username: username,
      password: hashedPassword,
      email: email,
    });
  
    //check if the user already exits
  
    let userExists;
    try {
      userExists = await UserSchema.findOne({ email });
    } catch (err) {
      return res.send({
        status: 400,
        message: "Internal server error, Please try again",
        error: err,
      });
    }
  
    if (userExists) {
      return res.send({
        status: 400,
        message: "User already exists",
      });
    }
  
    try {
      const userDB = await user.save(); // create opt in database
      console.log(userDB);
      res.redirect("/login");
      
    } catch (err) {
      return res.send({
        status: 400,
        message: "Internal Server Error, Please try again",
        error: err,
      });
    }
  });
  
  app.post("/login", async (req, res) => {
    console.log(req.session);
    const { loginId, password } = req.body;
  
    if (
      typeof loginId !== "string" ||
      typeof password !== "string" ||
      !loginId ||
      !password
    ) {
      return res.send({
        status: 400,
        message: "Invalid Data",
      });
    }
    //find return multiple obj inside an array
    //findOne return one object or null
  
    let userDB;
  
    try {
      if (validator.isEmail(loginId)) {
        userDB = await UserSchema.findOne({ email: loginId });
      } else {
        userDB = await UserSchema.findOne({ username: loginId });
      }
  
      console.log(userDB);
  
      if (!userDB) {
        return res.send({
          status: 400,
          message: "User not found, Please register first",
          error: err,
        });
      }
  
      //comapre the password
      const isMatch = await bcrypt.compare(password, userDB.password);
  
      if (!isMatch) {
        return res.send({
          status: 400,
          message: "Invalid Password",
          data: req.body,
        });
      }
  
      //final return
      req.session.isAuth = true;
      req.session.user = {
        username: userDB.username,
        email: userDB.email,
        userId: userDB._id,
      };
  
      res.redirect("/profile");
    } catch (err) {
      return res.send({
        status: 400,
        message: "Internal Server Error, Please loggin again!",
        error: err,
      });
    }
  });
  
  app.get("/home", isAuth, (req, res) => {
    if (req.session.isAuth) {
      return res.send({
        message: "This is your home page",
      });
    } else {
      return res.send({
        message: "Please Logged in again",
      });
    }
  });
  
  app.post("/logout", isAuth, (req, res) => {
    req.session.destroy((err) => {
      if (err) throw err;
  
      res.redirect("/login");
    });
  });
  
  app.post("/logout_from_all_devices", isAuth, async (req, res) => {
    console.log(req.session.user.username);
    const username = req.session.user.username;
  
    const Schema = mongoose.Schema;
    const sessionSchema = new Schema({ _id: String }, { strict: false });
    const SesisonModel = mongoose.model("session", sessionSchema);
  
    try {
      const sessionDb = await SesisonModel.deleteMany({
        "session.user.username": username,
      });
      console.log(sessionDb);
      return res.send({
        status: 200,
        message: "Logged out from all devices",
      });
    } catch (err) {
      return res.send({
        status: 400,
        message: "Logout from all devices failed",
        error: err,
      });
    }
  });

  app.get('/profile', isAuth, async(req,res)=>{
    res.render(profile)
  })


const port = process.env.PORT
app.listen(port, ()=>{
    console.log(` listening... to http://localhost:${port}`)
})




