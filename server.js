const express = require('express')
const sessions = require('express-session')
const connectDB = require('./config/database')
const logger = require('morgan')
require('dotenv').config()

// Connect to mongo
connectDB()

const app = express()

// config sessions session middleware
const oneDay = 1000 * 60 * 60 * 24
app.use(
  sessions({
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: true,
  })
)

// Config logger
app.use(logger('tiny'))

// parsing the incoming data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

var auth = function (request, response, next) {
  if (request.session && request.session.user === myusername) {
    // console.log('middleware', request.session)
    return next()
  } else response.redirect('/login')
}

//serving public file
app.use(express.static('public'))

//username and password
let myusername = 'espar'
let mypassword = '88888888'
let myname = ''

// a variable to save a session
let session

app.route('/login').get(getLoginHnadler).post(postLoginHandler)
app.route('/').get(auth, function (req, res) {
  res.send("You can only see this after you've logged in.")
})
app.route('/signup').get(getSignUpHandler).post(postSignUpHandler)
app.route('/logout').get((request, response) => {
  request.session.destroy()
  response.redirect('/')
})

// HANDLERS

//////////////////
// login
function postLoginHandler(request, response) {
  console.log('on post /login:', request.body)
  if (
    request.body.username == myusername &&
    request.body.password == mypassword
  ) {
    request.session.user = request.body.username
    //console.log(request.session)
    response.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`)
  } else {
    response.send('Invalid username or password')
  }
}

function getLoginHnadler(request, response) {
  // console.log('get login', request.session)
  session = request.session
  if (session.userid) {
    response.redirect('/content')
  } else response.sendFile(__dirname + '/views/login.html')
}

///////////////////
// Signup
const User = require('./models/user')
const validator = require('validator')

function getSignUpHandler(request, response) {
  response.sendFile(__dirname + '/views/signup.html')
}
async function postSignUpHandler(request, response) {
  const { name, username, password } = request.body
  // check if the fields are not empty and the password is correct
  if (username && name && password[0] && password[0] === password[1]) {
    // check if the user exist
    const userFound = await User.findOne({ userName: username }).exec()

    if (userFound) {
      console.log('existing user')
      return response.redirect('/signup')
    }
    const dbUser = new User({
      name: name,
      userName: username,
      password: password[0],
    })
    try {
      await dbUser.save()
      response.redirect('/login')
    } catch (err) {
      console.log('Error saving user')
      response.redirect('/signup')
    }
  } else {
    console.log('bad input values')
    response.redirect('/signup')
  }
}

// Open server port
app.listen(8000, () => {
  console.log('server running...')
})
