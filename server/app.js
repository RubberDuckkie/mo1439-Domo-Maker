const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const redis = require('redis');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/DomoMaker';

mongoose.connect(dbURL , (err) => {
    if (err){
        console.log('Could not connect to database');
        throw err;
    }
});


//Pull in our routes
const router = require('./router.js');

const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(session({
    key: 'sessionid',
    secret: 'Domo Arigato',
    resave: true,
    saveUninitialized: true,
}));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());

router(app);

app.listen(port, (err) => {
    if (err) {
        throw err;
    }
    console.log(`Listening on port ${port}`);
});

mongoose.connect(dbURL, (err) =>{
    if (err) {
        console.log('Could not connect to database');
        throw err;
    }
});

let redisURL = {
    hostname: 'redis-18885.c277.us-east-1-3.ec2.cloud.redislabs.com',
    port: '18885',
};

let redisPASS = 'FajWCJs20JftDCkfUir44xoRycnOGCMX';

if (process.env.REDISCLOUD_URL){
    redisURL = url.parse(process.env.REDISCLOUD_URL);
    [, redisPASS] = redisURL.auth.split(':');
}


const redisClient = redis.createClient({
    host: redisURL.hostname,
    port: redisURL.port,
    password: redisPASS,
});

app.use(session({
    key: 'sessionid',
    store: new RedisStore({
        client: redisClient,
    }),
    secret: 'Domo Arigato',
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
    },
}));