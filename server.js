const express = require('express');
const cors = require('cors');
const handlebars = require('express-handlebars');
var events = require('events');
var eventEmitter = new events.EventEmitter();

const connectDB = require('./Utils/connection');

//event handler for 'scream'
var screamHandler = ()=>{
    console.log('I hear a scream');
}

const app = express();
//const bodyParser = require('body-parser');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Serves static files (we need it to import a css file)
app.use(express.static('public'))

app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars({
    layoutsDir: __dirname + '/views/layouts'
}));

const PORT = 8084;

app.get('/home', async(req, res)=>{
    res.render('main', {layout: 'index.handlebars'});
})

app.listen(PORT, async()=>{
    console.log('Server listening on ' + PORT + "....");
    connectDB().then(()=>{
        console.log("MongoDB connected successfully....")
    }).catch((err)=>{
        console.log("Could not connect to database due to " + err);
    })
})