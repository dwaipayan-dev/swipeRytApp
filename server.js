
//read environment variable from .env file
require('dotenv').config();


const express = require('express');
const cors = require('cors');
const handlebars = require('express-handlebars');

const connectDB = require('./Utils/connection');

const app = express();
//const bodyParser = require('body-parser');

const accountSid = 'AC5f47155b4f11def13c53cc5cc7727a6d' || process.env.TWILIO_ACCOUNT_SID;
const authToken =  'c261868e6370a827dd5dd758d0b71d99' || process.env.TWILIO_AUTH_TOKEN;
const senderPhone = '+18566197111' || process.env.TWILIO_SENDER_PHONE
const client = require('twilio')(accountSid, authToken);

//For jwt Authorization
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const SECRET = 'likethat' || process.env.JWT_SECRET

//load db models
const User = require('./Models/User.model');

//Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Serves static files (we need it to import a css file)
app.use(express.static('public'))

app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars({
    layoutsDir: __dirname + '/views/layouts'
}));

const PORT = 8084;

//test route
app.get('/home', async(req, res)=>{
    res.render('main', {layout: 'index.handlebars'});
})

app.get('/welcome/:imgId', async(req, res)=>{
    const jwtIsValid = validateJwt(req);
    console.log(jwtIsValid)
    if(jwtIsValid === 0){
        res.status(400).send("Signup or login to continue....")
    }
    else{
        res.status(200);
        res.render('welcome', { layout: 'index.handlebars', imgId: req.params.imgId, firstName: jwtIsValid.firstName, lastName: jwtIsValid.lastName});
    }
})

//Signup APIs
app.get('/signup/step1', async(req, res)=>{
    res.render('signup_step1', { layout: 'parent.handlebars' })
});

app.post('/signup/step2', async(req, res)=>{
    console.log("Phone number Returns successfully");
    let phoneNumber = req.body.number;

    client.messages
      .create({body: '0000 is the code for authentication', from: senderPhone, to: phoneNumber})
      .then(message => {
          console.log(message.sid);
          //res.status(200).send("OK");
          res.render('signup_step2', { layout: 'parent.handlebars', msgId: message.sid, phoneNumber: phoneNumber});
      })
      .catch(err=>{
        res.render('signup_step1', { layout: 'parent.handlebars', error: err });
      })
    
});

app.post('/signup/step3', async(req, res) =>{
    let token = req.body.token;
    let messageId = req.body.messageId;

    client.messages(messageId)
    .fetch()
    .then((message)=>{
        phoneNumber = message.to;
        console.log(phoneNumber)
        //subject to change depending on type og twilio account
        console.log(message.body);
        otp = message.body.substring(38, 42);
        if(token === otp){
            res.render('signup_step3', { layout: 'parent.handlebars', phoneNumber: phoneNumber });
        }
        else{
            res.render('signup_step2', { layout: 'parent.handlebars', error: "Incorrect OTP" });
        }
    })
    .catch(err => {
        res.render('signup_step1', { layout: 'parent.handlebars', error: err });
    })
})

app.post('/signup/authenticate', async(req, res) =>{
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let phoneNumber = req.body.phoneNumber;
    //console.log(phoneNumber);
    //console.log({firstName, lastName, phoneNumber});
    //Add to database
    
    let oldUser = await User.findOne({phone_number: phoneNumber});
    if(oldUser !== null){
        console.log(oldUser);
        res.status(401).send("User already exists....");
    }
    else{
        try{
            let user = new User({first_name: firstName, last_name: lastName, phone_number: phoneNumber});
            await user.save();
            //jwt code
            //Create jwt token
            const token = jwt.sign({
                phoneNumber: user.phone_number,
                firstName: user.first_name,
                lastName: user.last_name
            }, SECRET, {
                expiresIn: "72h"
            });

            console.log("Auth_token is: " + token);
            res.cookie('Authorization', token)
            //res.status(200);
            //res.redirect('/welcome/1');
            //res.status(200);
            res.render('simple', {layout: 'redirect.handlebars'});
        }
        catch(err){
            console.log(err);
            res.status(400).send("User cannot be registered due to " + err);
        }
    } 
})

//Login APIs
app.get('/signin/step1', async(req, res)=>{
    res.render('login_step1', { layout: 'parent.handlebars' })
});

app.post('/signin/step2', async(req, res)=>{
    console.log("Phone number Returns successfully");
    let phoneNumber = req.body.number;

    client.messages
      .create({body: '0000 is the code for authentication', from: senderPhone, to: phoneNumber})
      .then(message => {
          console.log(message.sid);
          //res.status(200).send("OK");
          res.render('login_step2', { layout: 'parent.handlebars', msgId: message.sid, phoneNumber: phoneNumber});
      })
      .catch(err=>{
        res.render('login_step1', { layout: 'parent.handlebars', error: err });
      })
});

app.post('/signin/step3', async(req, res)=>{
    let token = req.body.token;
    let messageId = req.body.messageId;

    client.messages(messageId)
    .fetch()
    .then((message)=>{
        phoneNumber = message.to;
        console.log(phoneNumber)
        //subject to change depending on type og twilio account
        console.log(message.body);
        otp = message.body.substring(38, 42);
        if(token === otp){
            //res.render('signup_step3', { layout: 'parent.handlebars', phoneNumber: phoneNumber });
            res.redirect(307, '/signin/authenticate');
        }
        else{
            res.render('login_step2', { layout: 'parent.handlebars', error: "Incorrect OTP" });
        }
    })
    .catch(err => {
        res.render('login_step1', { layout: 'parent.handlebars', error: err });
    })
});

app.post('/signin/authenticate', async(req, res)=>{
    let phoneNumber = req.body.phoneNumber;
    //console.log("Phone number is " + req.body.phoneNumber);
    try{
        let oldUser = await User.findOne({ phone_number: phoneNumber });
        if (oldUser !== null) {
            //jwt auth
            const token = jwt.sign({
                phoneNumber: oldUser.phone_number,
                firstName: oldUser.first_name,
                lastName: oldUser.last_name
            }, SECRET, {
                expiresIn: "72h"
            });

            console.log("Auth_token is: " + token);
            res.cookie('Authorization', token)
            //res.status(200).send({msg: "Logged in!!", user: oldUser, token: token});
            //res.redirect('/welcome/1');
            //res.status(200);
            res.render('simple', {layout: 'redirect.handlebars'});
        }
        else {
            res.status(401).send("No such user found. You must sign in first");
        }
    }
    catch(err){
        res.status(400).send("Could not log in due to error " + err);
    }
})

app.listen(PORT, async()=>{
    console.log('Server listening on ' + PORT + "....");
    connectDB().then(()=>{
        console.log("MongoDB connected successfully....")
    }).catch((err)=>{
        console.log("Could not connect to database due to " + err);
    })
})

function validateJwt(req){
    const AuthToken = req.cookies.Authorization || req.query.auth;
    if(!AuthToken){
        return 0;
    }
    else{
        try{
            let decoded = jwt.verify(AuthToken, SECRET);
            return decoded;
        }
        //if JWT expires
        catch(err){
            //console.log(err);
            return 0;
        }
        
    }
}