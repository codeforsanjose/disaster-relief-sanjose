import express from 'express'
import bodyParser from 'body-parser'
import bcrypt from 'bcryptjs'
import fs from 'fs'

import session from 'express-session'
const redis = require('redis')
let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_URL)
import _ from 'lodash'
import errorHandler from 'errorhandler'
import passport from 'passport'
import path from 'path'
import cookieParser from 'cookie-parser'

import { posts_db_name } from './backend/Utilities/API_utilities'
import { db } from './backend/lib/db'
import { init } from './backend/lib/auth'
import { postsRouter } from './backend/routes/postsRoutes'
import { usersRouter } from './backend/routes/userRoutes'

const app = express()
const publicDir = __dirname + '/public'
const MessagingResponse = require('twilio').twiml.MessagingResponse;

app.use(bodyParser({limit: '4MB'}))
app.use(bodyParser.json());
app.set('port', process.env.PORT || 8080)
app.use((req, res, next) =>{
  res.setHeader('Access-Control-Allow-Origin', '*, disaster-response.s3-website-us-west-1.amazonaws.com');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});
app.use('/public', express.static('public'))
app.use(cookieParser())
const HALF_HOUR = 1000 * 60 * 30
let sessionConfigs = { secret: 'keyboard cat', cookie: { maxAge: HALF_HOUR, sameSite: true }, rolling: true, resave: false, saveUninitialized: false };
if (process.env.NODE_ENV === 'production') { sessionConfigs.store = new RedisStore({ client: redisClient }); sessionConfigs.cookie.secure = true; sessionConfigs.resave = false; sessionConfigs.secret = process.env.SESSION_SECRET };
app.use(session(sessionConfigs))
// app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))
app.use(postsRouter)
app.use(usersRouter)

init(app)

app.get(['/', '/login'], (req, res) => {
    res.sendFile(path.join(publicDir, '/index.html'))
})

app.post('/api/login', (req, res, next) => {
    // See: https://github.com/jaredhanson/passport-local
    passport.authenticate('local', (err, user, info) => {
        if (err || !user) {
            req.user = user
            console.log('error with login:', err, user)
            return res.status(422).json(err)
        }
        req.login(user, () => {
            return res.json(user)
        })
    })(req, res, next)

})

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message('SMS works!');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(app.get('port'), function () {
    console.log('[*] disaster response running on port', app.get('port'))
})
