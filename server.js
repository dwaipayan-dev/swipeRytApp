
//read environment variable from .env file
require('dotenv').config();


const express = require('express');
const cors = require('cors');
const handlebars = require('express-handlebars');

const connectDB = require('./Utils/connection');

const app = express();
//const bodyParser = require('body-parser');

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC5f47155b4f11def13c53cc5cc7727a6d';
const authToken =  process.env.TWILIO_AUTH_TOKEN || 'c261868e6370a827dd5dd758d0b71d99';
const senderPhone = process.env.TWILIO_SENDER_PHONE || '+18566197111'
const client = require('twilio')(accountSid, authToken);

//For jwt Authorization
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const SECRET = process.env.JWT_SECRET || 'likethat'

//load db models
const User = require('./Models/User.model');
const History = require('./Models/History.model');

//Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//Cors middleware
app.use(cors({
    origin: '*'
}));
app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));
//Serves static files (we need it to import a css file)
app.use(express.static('public'))

app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars({
    layoutsDir: __dirname + '/views/layouts'
}));

const PORT = process.env.NODE_PORT || 8084;

//test routes(For experimenting)
app.get('/test', async(req, res)=>{
    res.status(200).send("Welcome");
})

app.get('/home', async(req, res)=>{
    res.render('main', {layout: 'index.handlebars'});
})

//Main Route. I have only used id to constuct image src as there were only 5 images given. If there are more images. It can easily be resolved by a mongoose collection named 'images' and fetching image based on Id
app.get('/welcome/:imgId', async(req, res)=>{
    const jwtIsValid = validateJwt(req);
    //console.log(jwtIsValid)
    if(jwtIsValid === 0){
        res.status(400).send("Signup or login to continue....")
    }
    else{
        if(req.params.imgId > 5){
            res.status(200).send("You have rated all the images...");
        }
        else{
            res.status(200);
            res.render('welcome', { layout: 'index.handlebars', imgId: req.params.imgId, firstName: jwtIsValid.firstName, lastName: jwtIsValid.lastName});
        }
        
    }
})

//Event Routes(swipedLeft and swipedRight)
app.post('/swipedRight', async(req, res)=>{
    const jwtIsValid = validateJwt(req);
    //console.log(jwtIsValid)
    if (jwtIsValid === 0) {
        res.status(400).send("Signup or login to continue....")
    }
    else {
        try{
            const imgId = req.body.id;
            console.log("Image Id for selected image is " + imgId);
            const newEntry = new History({
                user_phone: jwtIsValid.phoneNumber,
                image_id: imgId,
                status: "selected"
            });
            await newEntry.save();
            res.status(200).send(jwtIsValid.firstName + " " + jwtIsValid.lastName + "has selected image with id " + imgId);
        }
        catch(err){
            res.status(400).send("Entry could not be saved due to error " + err);
        }
    }
});

app.post('/swipedLeft', async(req, res)=>{
    const jwtIsValid = validateJwt(req);
    //console.log(jwtIsValid)
    if (jwtIsValid === 0) {
        res.status(400).send("Signup or login to continue....")
    }
    else {
        try{
            const imgId = req.body.id;
            console.log("Image Id for rejected image is " + imgId);
            const newEntry = new History({
                user_phone: jwtIsValid.phoneNumber,
                image_id: imgId,
                status: "rejected"
            });
            await newEntry.save();
            res.status(200).send(jwtIsValid.firstName + " " + jwtIsValid.lastName + "has rejected image with id " + imgId);
        }
        catch(err){
            res.status(400).send("Entry could not be saved due to error " + err);
        }
    }
});

//User History Route
app.get('/history', async(req, res)=>{
    const jwtIsValid = validateJwt(req);
    //console.log(jwtIsValid)
    if (jwtIsValid === 0) {
        res.status(400).send("Signup or login to continue....")
    }
    else{
        try{
            //.lean returns json instead of mongoose object
            let user_history = await History.find({user_phone: jwtIsValid.phoneNumber}).lean();
            //res.status(200).send(user_history);
            res.status(200);
            res.render('history', {layout: 'parent.handlebars', items: user_history, firstName: jwtIsValid.firstName, lastName: jwtIsValid.lastName})
        }
        catch(err){
            res.status(400).send("Query could not be fetched due to err " + err);
        }
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
            res.status(200);
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
        //subject to change depending on type of twilio account
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
            res.status(200);
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

module.exports = app.listen(process.env.PORT || PORT, async()=>{
    console.log('Server listening on ' + PORT + "....");
    /*
    connectDB().then(()=>{
        console.log("MongoDB connected successfully....")
    }).catch((err)=>{
        console.log("Could not connect to database due to " + err);
    })
    */
    try{
        await connectDB();
        console.log("MongoDB connected successfully....")
    }
    catch(err){
        console.log("Could not connect to database due to " + err);
    }
   
    
});

