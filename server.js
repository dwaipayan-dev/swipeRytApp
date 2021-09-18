const express = require('express');
const cors = require('cors');
const handlebars = require('express-handlebars');

const connectDB = require('./Utils/connection');

const app = express();
//const bodyParser = require('body-parser');

const accountSid = 'AC5f47155b4f11def13c53cc5cc7727a6d' || process.env.TWILIO_ACCOUNT_SID;
const authToken =  '787c70df2e5b7add992f34f725d8f07c' || process.env.TWILIO_AUTH_TOKEN;
const senderPhone = '+18566197111' || process.env.TWILIO_SENDER_PHONE
const client = require('twilio')(accountSid, authToken);

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
    console.log(phoneNumber);
    console.log({firstName, lastName, phoneNumber});
    //Add to database

    res.status(200).send();
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
        req.session.phoneNumber = phoneNumber;
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
    console.log("Phone number is " + req.session.phoneNumber);
    res.status(200).send("OK")
})

app.listen(PORT, async()=>{
    console.log('Server listening on ' + PORT + "....");
    connectDB().then(()=>{
        console.log("MongoDB connected successfully....")
    }).catch((err)=>{
        console.log("Could not connect to database due to " + err);
    })
})