const request = require("supertest");
const connectDb = require("../db/connect")
const mongoose = require('mongoose')
const app = require("../app");
const User = require("../models/User")
require('dotenv').config()

// Test suit for /api/v1/auth/register
describe("Test the /api/v1/auth/register POST route", () => {
    
    //Because we use real database, so that before we insert the test data, we must delete inserted testing user if it existed
    beforeAll(async () => {
        await connectDb(process.env.MONGO_URI)
        await User.findOneAndDelete({email:'someoneemail@gmail.com'}) //Delete testing user we inserted before
    });

    test("It should return status code 201, name of user and access token", async () => {
        const data = {
            name:'khatuantran',
            email: 'someoneemail@gmail.com',
            password: 'tiny123'
        }
        const response = await request(app).post("/api/v1/auth/register").send(data)
        expect(response.statusCode).toBe(201) 
        expect(response.body.user.name).toBe('khatuantran')
        expect(response.body.token).toBeDefined()
    });

    //After all we must disconnect to database otherwise we will recieve an error 
    afterAll(async () => {
        await mongoose.disconnect()
    })
});

//Testsuit for /api/v1/auth/login
describe("Test the /api/v1/auth/login POST route", () => {
    
    // Connect to database
    beforeAll(async () => {
        await connectDb(process.env.MONGO_URI)
    });

    //Success test case 
    test("It should return name of user and access token", async () => {
        const data = {
            email: 'someoneemail@gmail.com',
            password: 'tiny123'
        }
        const response = await request(app).post("/api/v1/auth/login").send(data)
        expect(response.statusCode).toBe(200) 
        expect(response.body.user.name).toBe('khatuantran')
        expect(response.body.token).toBeDefined()
    });

    //Fail test cases
    test("It should return status code 400 bad request", async () => {
        
        const response = await request(app).post("/api/v1/auth/login")
        expect(response.statusCode).toBe(400) 
        expect(response.body.msg).toBe('Please provide email and password')
       
    });

    test("It should return status code 401 unauthenticate user", async () => {
        
        const data = {
            email: 'wrongemail@gmail.com',
            password: 'dummypass'
        }
        const response = await request(app).post("/api/v1/auth/login").send(data)
        expect(response.statusCode).toBe(401) 
        expect(response.body.msg).toBe('Invalid Credentials')
       
    });

    test("It should return status code 401 invalid password input", async () => {
        
        const data = {
            email: 'someoneemail@gmail.com',
            password: 'wrongpassinput'
        }
        const response = await request(app).post("/api/v1/auth/login").send(data)
        expect(response.statusCode).toBe(401) 
        expect(response.body.msg).toBe('Invalid password input')
       
    });

    //Disconnect database
    afterAll(async () => {
        await mongoose.disconnect()
    })
});


