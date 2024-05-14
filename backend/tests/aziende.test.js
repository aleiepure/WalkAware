const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const request = require('supertest');
require('dotenv').config();
const UtenteWeb = require('../models/utente_web');
const AziendaModel = require('../models/azienda');




beforeAll(async () => {
    jest.setTimeout(8000);
    app.locals.db = mongoose.connect(process.env.MONGODB_URI_TEST);
    // create a standard mobile user
    standardUserWeb = new UtenteWeb({
        nome: "mario",
        email: "web@test.com",
        password: "123",
    });
    await standardUserWeb.save();

    // create a standard mobile user
    standardAzienda = new AziendaModel({
        nome: "aziendaName2",
        p_iva: "111111111111",
        email: "azienda2@test.com",
        password: "passwordAzienda2"
    });
    await standardAzienda.save();
    // create a valid token
    const token_secret = process.env.SUPER_SECRET;
    token = jwt.sign({ email: 'web@test.com', id: standardUserWeb._id },
        token_secret, { expiresIn: "1y" });

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



// Testing add a new azienda
describe("POST /api/v1/aziende", () => {

    test("POST /api/v1/aziende Valid request", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                email: "azienda@test.com",
                password: "passwordAzienda"
            })
            .expect(201);
    });

    test("POST /api/v1/aziende User already existing", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                email: "azienda@test.com",
                password: "passwordAzienda"
            })
            .expect(401, { success: false, error: 'An azienda with the same email already exists.' });
    });

    test("POST /api/v1/aziende Missing email", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                password: "passwordAzienda"
            })
            .expect((400), { success: false, error: "The 'email' field must be a non-empty string in email format." });
    });

    test("POST /api/v1/aziende Password field not a string", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                email: "azienda@test.com",
                password: 4123413
            })
            .expect(400, { success: false, error: 'The "password" field must be a non-empty string.' });
    });

});



// Test get azienda by id
describe("GET /api/v1/aziende/{id}", () => {
    test("GET /api/v1/aziende/{id} Valid request", () => {
        return request(app)
            .get(`/api/v1/aziende/${standardAzienda._id}`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.body).toHaveProperty("azienda");
                expect(res.body.azienda).toHaveProperty("nome");
                expect(res.body.azienda.nome).toBe(standardAzienda.nome);
                expect(res.body.azienda).toHaveProperty("p_iva");
                expect(res.body.azienda.p_iva).toBe(standardAzienda.p_iva);
                expect(res.body.azienda).toHaveProperty("email");
                expect(res.body.azienda.email).toBe(standardAzienda.email);
                expect(res.body.azienda).toHaveProperty("password");
                expect(res.body.azienda.password).toBe(standardAzienda.password);
            });
    });

    test("GET /api/v1/aziende/{id} InvalidID", () => {
        return request(app)
            .get(`/api/v1/aziende/InvalidIdInvalidId`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(404, { success: false, error: "Azienda not found" });

    });
});

// Testing get all aziende
describe("GET /api/v1/aziende", () => {
    test("GET /api/v1/aziende Valid request", () => {
        return request(app)
            .get("/api/v1/aziende")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.body).toHaveProperty("aziende");
                expect(res.body.aziende).toBeInstanceOf(Array);
                expect(res.body.aziende.length).toBeGreaterThan(0);
                expect(res.body.aziende[0]).toHaveProperty("nome");
                expect(res.body.aziende[0]).toHaveProperty("p_iva");
            });
    });

    test("GET /api/v1/aziende Valid request with empty response", async () => {
        await dropAllCollections();
        return request(app)
            .get("/api/v1/aziende")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.body).toHaveProperty("aziende");
                expect(res.body.aziende).toBeInstanceOf(Array);
                expect(res.body.aziende.length).toBe(0);
            });
    });

});