const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const request = require('supertest');
require('dotenv').config();

const UtenteWeb = require('../models/utente_web');
const AziendaModel = require('../models/azienda');

beforeAll(async () => {
    jest.setTimeout(15000);
    app.locals.db = mongoose.connect(process.env.MONGODB_URI_TEST);

    // create a standard mobile user
    standardUserWeb = new UtenteWeb({
        nome: "mario",
        email: "web@test.com",
        password: "123",
    });
    await standardUserWeb.save();

    // create a standard azienda
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

describe("POST /api/v1/aziende: Aggiunta di un'azienda", () => {
    test("Richiesta valida", () => {
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
            .expect(201)
            .expect((res) => {
                expect(res.headers.location).toBeDefined();
                expect(res.body.success).toBe(true);
            });
    });

    test("Azienda già esistente", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                nome: "aziendaName2",
                p_iva: "111111111111",
                email: "azienda2@test.com",
                password: "passwordAzienda2"
            })
            .expect(401, { success: false, error: 'An azienda with the same email already exists.' });
    });

    test("Campo email non fornito", () => {
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

    test("Campo password non è una stringa", () => {
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

describe("GET /api/v1/aziende/:id: Lettura di un'azienda", () => {
    test("Richiesta valida", () => {
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

    test("ID non trovato", () => {
        return request(app)
            .get(`/api/v1/aziende/InvalidIdInvalidId`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(404, { success: false, error: "Azienda not found" });

    });
});

describe("GET /api/v1/aziende: Lettura di tutte le aziende", () => {
    test("Richiesta valida", () => {
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

    test("Richiesta valida con body vuoto", async () => {
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
