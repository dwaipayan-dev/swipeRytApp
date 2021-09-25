let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server.js');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'likethat';
const test_token = jwt.sign({
    phoneNumber: '+918628065854',
    firstName: "Shah",
    lastName: "Raj"
}, SECRET, {
    expiresIn: "720h"
});

//Assertion style
chai.should();

chai.use(chaiHttp);

//Now we can call our restful API using http protocol

describe("swipeRyt API", () => {

    /*
    Test route
    */
    /*
    describe("GET /test", ()=>{
        it("should return welcome message", function(done){
             this.timeout(5000);
             chai.request(server)
                 .get("/test")
                 .then((err,response) =>{
                     console.log(response.body);
                     response.should.have.status(200);
                     response.body.should.be.a('string')
                 done();
                 }).then().catch(err => {
                     console.log(err);
                 })
        })
    })
    */
    it("GET /test should return welcome message", function (done) {
        console.log("INFO");
        chai.request(server).get('/test').end((err, res) => {
            if (err) {
                done(err)
            }
            else {
                res.should.have.status(200);
                res.text.should.equal('Welcome');
                done();
            }
        })
    });

    it("POST /signin/authenticate should return empty html(then redirected to main page)", function (done) {
        console.log("INFO");
        chai.request(server).post('/signin/authenticate')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ phoneNumber: '+918628065854' })
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    res.should.have.status(200);
                    //res.text.should.equal('Welcome');
                    res.should.to.be.html;
                    done();
                }
        });
    });
    /*
    //would pass only once, as duplicate entries not allowed in database
    it("POST /signup/authenticate should return empty html(then redirected to main page)", function (done) {
        console.log("INFO");
        chai.request(server).post('/signup/authenticate')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ firstName: "Garuda", lastName: "Xavier", phoneNumber: '+918840652415' })
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    res.should.have.status(200);
                    //res.text.should.equal('Welcome');
                    res.should.to.be.html;
                    done();
                }
        });
    });
    */

    it("GET /welcome/1 should return html with welcome and first image", function (done) {
        console.log("INFO");
        chai.request(server).get('/welcome/1').query({auth: test_token}).end((err, res) => {
            if (err) {
                done(err)
            }
            else {
                //console.log(res.text, res.body);
                res.should.have.status(200);
                res.text.should.include('Welcome');
                done();
            }
        })
    });

    it("POST /swipedRight should return message that user has selected image)", function (done) {
        console.log("INFO");
        chai.request(server).post('/swipedRight')
            .set('content-type', 'application/json')
            .query({
                auth: test_token
            })
            .send({
                id: 1
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    res.should.have.status(200);
                    res.text.should.include('selected');
                    console.log(res.text);
                    done();
                }
        });
    });

    it("POST /swipedLeft should return message that user has rejected image)", function (done) {
        console.log("INFO");
        chai.request(server).post('/swipedLeft')
            .set('content-type', 'application/json')
            .query({
                auth: test_token
            })
            .send({
                id: 2
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    res.should.have.status(200);
                    res.text.should.include('rejected');
                    console.log(res.text);
                    done();
                }
        });
    });

    it("GET /history should return html with user history of current jwt", function (done) {
        console.log("INFO");
        chai.request(server).get('/history').query({auth: test_token}).end((err, res) => {
            if (err) {
                done(err)
            }
            else {
                console.log(res.text);
                res.should.have.status(200);
                res.should.to.be.html;
                res.text.should.include('Here is you Swipe History');
                done();
            }
        })
    });

})
