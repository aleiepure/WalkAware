const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const request = require('supertest');
require('dotenv').config();

const utenteWebModel = require('../models/utente_web.js');

let standardUserId;
let standardUserIdWeb;
beforeAll(async () => {
    jest.setTimeout(15000);
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    let standardUserWeb = new utenteWebModel({
        nome: "Franco",
        email: "web@test.com",
        password: "password456",
    });
    await standardUserWeb.save();
    standardUserIdWeb = standardUserWeb._id;
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

afterAll(async () => {
    await dropAllCollections();
    mongoose.connection.close();
});

describe("POST /api/v1/utente/web/login: Login utente webapp", () => {
    test("Login valido", () => {
        return request(app)
            .post("/api/v1/utente/web/login")
            .set('Accept', 'application/json')
            .send({
                email: "web@test.com",
                password: "password456",
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.token).toBeDefined();
            });
    });

    test("Email sbagliata", () => {
        return request(app)
            .post("/api/v1/utente/web/login")
            .set('Accept', 'application/json')
            .send({
                email: "web2@test.com",
                password: "password456",
            })
            .expect(401, { success: false, error: 'Authentication failed. User not found.' });
    });

    test("Campo email vuoto", () => {
        return request(app)
            .post("/api/v1/utente/web/login")
            .set('Accept', 'application/json')
            .send({
                email: "",
                password: "password456",
            })
            .expect(400, { success: false, error: "The 'email' field must be a non-empty string in email format." });
    });

    test("Campo email contenente qualcosa di diverso da una stringa", () => {
        return request(app)
            .post("/api/v1/utente/web/login")
            .set('Accept', 'application/json')
            .send({
                email: 12,
                password: "password456",
            })
            .expect(400, { success: false, error: "The 'email' field must be a non-empty string in email format." });
    });

    test("Password sbagliata", () => {
        return request(app)
            .post("/api/v1/utente/web/login")
            .set('Accept', 'application/json')
            .send({
                email: "web@test.com",
                password: "password890",
            })
            .expect(401, { success: false, error: 'Authentication failed. Incorrect password.' });
    });

    test("Campo password contenente qualcosa di diverso da una stringa", () => {
        return request(app)
            .post("/api/v1/utente/web/login")
            .set('Accept', 'application/json')
            .send({
                email: "web@test.com",
                password: 23,
            })
            .expect(400, { success: false, error: "The 'password' field must be a non-empty string." });
    });

    test("Campo password vuoto", () => {
        return request(app)
            .post("/api/v1/utente/web/login")
            .set('Accept', 'application/json')
            .send({
                email: "web@test.com",
                password: "",
            })
            .expect(400, { success: false, error: "The 'password' field must be a non-empty string." });
    });
});
