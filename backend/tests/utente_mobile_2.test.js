const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const request = require('supertest');
require('dotenv').config();
const { utenteMobileModel } = require('../models/utente_mobile.js');

let standardUserId;
beforeAll(async () => {
    jest.setTimeout(15000);
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    let standardUser = new utenteMobileModel({
        nome: "mario",
        eta: 21,
        email: "mobile@test.com",
        password: "123",
        punti: 1000,
        buoni: [],
        segnalazioni: [],
    });
    await standardUser.save();
    standardUserId = standardUser._id;
});


async function dropAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        try {
            await collection.drop();
        } catch (error) {
            // This error happens when you try to drop a collection that's already dropped. Happens infrequently. 
            // Safe to ignore. 
            if (error.message === 'ns not found') return;

            // This error happens when you use it.todo.
            // Safe to ignore. 
            if (error.message.includes('a background operation is currently running')) return;

            console.log(error.message);
        }
    }
}

// Disconnect Mongoose
afterAll(async () => {
    await dropAllCollections();
    mongoose.connection.close();
});


describe("POST /api/v1/utente/mobile", () => {

    test("Valid request", () => {
        return request(app)
            .post("/api/v1/utente/mobile")
            .set('Accept', 'application/json')
            .send({
                nome: "caa",
                email: "ottaviano@gmail.com",
                password: "buondiomollami",
                eta: 34
            })
            .expect(201);
    });
    test("POST /api/v1/utente/mobile Utente esiste già", () => {
        return request(app)
            .post("/api/v1/utente/mobile")
            .send({
                nome: "mario",
                eta: 44,
                email: "mobile@test.com",
                password: "123"
            })
            .expect(400, { success: false, error: "A mobile user with the same email already exists." });
    });
    test("Email in un formato non valido", () => {
        return request(app)
        .post("/api/v1/utente/mobile")
        .set('Accept', 'application/json')
        .send({
            nome: "caa",
            email: "caa",
            password: "passwordiswrong",
            eta: 34
        })
        .expect(400, {success: false, error:"The 'email' field must be a non-empty string in email format."});
    });
    test("Età inferiore ai 18 anni", () => {
        return request(app)
        .post("/api/v1/utente/mobile")
        .set('Accept', 'application/json')
        .send({
            nome: "caa",
            email: "ottaviano@gmail.com",
            password: "passwordiswrong",
            eta: 15
        })
        .expect(400, {success: false, error:"The 'eta' field must be a number greater than 18."});
    });

    test("La password deve essere una stringa non vuota", () => {
        return request(app)
        .post("/api/v1/utente/mobile")
        .set('Accept', 'application/json')
        .send({
            nome: "caa",
            email: "francogallo@gmail.com",
            password: "",
            eta: 23
        })
        .expect(400, {success: false, error:"The 'password' field must be a non-empty string"});
    });
});

describe ("POST api/v1/utente/mobile/login", ()=> {
    test("Login valido", ()=>{
        return request(app)
        .post("/api/v1/utente/mobile/login")
        .set('Accept', 'application/json')
        .send({
            email: "mobile@test.com",
            password: "123"
        })
        .expect(200);
    })
    test("User not found", ()=>{
        return request(app)
        .post("/api/v1/utente/mobile/login")
        .set('Accept', 'application/json')
        .send({
            email: "nonesistocomeuser@test.com",
            password: "mistero"
        })
        .expect(401, { success: false, error: 'Authentication failed. User not found.' });
    })
    test("Controllo password corretta", () =>{
        return request(app)
        .post("/api/v1/utente/mobile/login")
        .set('Accept', 'application/json')
        .send({
            email: "mobile@test.com",
            password: "mistero"
        })
        .expect(401, { success: false, error: 'Authentication failed. Incorrect password.' });

    })

    test("Controllo campo email vuoto", () =>{
        return request(app)
        .post("/api/v1/utente/mobile/login")
        .set('Accept', 'application/json')
        .send({
            email: "",
            password: "mistero"
        })
        .expect(400, { success: false, error: "The 'email' field must be a non-empty string in email format." });
    })

    test("Controllo campo password vuoto", () =>{
        return request(app)
        .post("/api/v1/utente/mobile/login")
        .set('Accept', 'application/json')
        .send({
            email: "mobile@test.com",
            password: ""
        })
        .expect(400, { success: false, error: "The 'password' field must be a non-empty string." });
    })

})