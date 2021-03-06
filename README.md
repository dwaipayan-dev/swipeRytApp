# swipeRytApp
API to select, reject or ignore images by the action of swiping. Supports 2FA, authorization, and history feature. I have tried to go the extra mile and implemented server side rendering/frontend using express handlebars as the view engine. I would like to thank Trinkerr Development Team for giving me the opportunity to develop this API. This API is deployed on Heroku, available for public (However, do not spam the 2FA as it may end up using all my free credits). 



# Prerequisites

1. Postman


# Setting up the API

 1. Copy the project into your local machine.
 2. Provide your twilio authorization tokens in the placeholders given in server.js.
 3. Change JWT secret if you wish.
 4. Open a new terminal and type:
    ```
    npm start
    ```
 5. Wait for the message Server is listening...
 6. You can now start sending requests.
 7. You can also run the testcases written using below command
    ```
    npm test
 
# Importing Postman

Open Postman, click on import from a collection. Then select the postman collection file on this repo. All the requests and examples would be imported.

# Usage:

Following are the routes used in this application.


# Route 1: Signup route:

This route is intended to be divided into 4 steps. However for testing purposes I have intentionally enabled the last step to work on its own.

The 4 steps are as follows. Steps 1, 2, 3 depend on previous' output. PLease refer the postman collection for correct usage.
1. GET /signup/step1: renders template that asks user to enter a valid phonenumber to recieve otp.
2. POST /signup/step2: Sends SMS to the phone number given in previous step and renders template that asks for the OTP received. For this application, given assumption was that otp would always be 0000
3. POST /signup/step3: Verifies the OTP and renders template that asks for users first name and last name to sign them up.
4. POST /signup/authenticate: Creates a new user based on previous' inputs, generates jwt and redirects to /welcome/1

# Route 2: Signin route:

This route is intended to be divided into 4 steps. However for testing purposes I have intentionally enabled the last step to work on its own.

The 4 steps are as follows. Steps 1, 2, 3 depend on previous' output. PLease refer the postman collection for correct usage.
1. GET /signin/step1: renders template that asks user to enter a valid phonenumber to recieve otp.
2. POST /signin/step2: Sends SMS to the phone number given in previous step and renders template that asks for the OTP received. For this application, given assumption was that otp would always be 0000
3. POST /signin/step3: Verifies the OTP and redirects to signin/authenticate.
4. POST /signup/authenticate: Checks if user exists, generates jwt and redirects to /welcome/1

# Route 3: Welcome route:

GET /welcome/:id: Authorization required. Takes image id as path parameter and renders a template with welcome message and rendered image with passed image id. When the rendered image is swiped left or right it triggers event routes and redirects to next id. If nothing is done for 5 seconds it simply redirects to next id i.e. next image. When image id exceeds max no. of image it displays message that all images are rated.

# Route 4: Event routes:

There are two event routes. They are called from within the frontend when image is swiped left/right. But given you have authorization token, can be called externally. Authorization required.

1. POST /swipedLeft: Creates a new entry in history collection with image status as rejected.
2. POST /swipedRight: Creates a new entry in history collection with image status as selected.

# Route 5: History route:

GET /history: Authorization required. Shows the logged in users' history of swiped images along with status selected/rejected.

# Vulnerabilities

There are some things that can be improved upon. I was working under a deadline and hence could not include these within time. But I intend on updating the project with the required changes soon. 

1. As mentioned above 2FA is not necessary to signup or signin. This was intentionally done and it was necessary at the time because I was working with a free tier account of Twilio API (SMS sending API), where I had limited number of credits to send and receive SMS on my phone for 2FA. With a premium account and a simple validation jwt, this can be remedied.
2. UI could be made a little better. It was my first time working with handlebars and for some reason unknown to me, bootstrap classes were not working in Handlebars.

# Heroku URL: 
This API is deployed on heroku, accessible by base URL:
```
https://swipe-ryt-by-me-v01.herokuapp.com
```
Please refer to Postman collection to see usage examples.

# Final Note:

Thank you for reading this far. If you face any issues with the API, feel free to connect to me about it. I would look forward to your feedback:)



