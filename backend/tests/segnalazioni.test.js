const app = require('../app');
const mongoose = require("mongoose");
const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Mock minio module
const minio = require("minio");
let mockPutObject = jest.fn()
    .mockResolvedValueOnce()
    .mockRejectedValueOnce(new Error('Error uploading image'));
minio.Client.prototype.putObject = mockPutObject;

let mockPresignedGetObject = jest.fn()
    .mockResolvedValueOnce('https://example.com/1234')
    .mockRejectedValueOnce(new Error('Error retrieving image'));
minio.Client.prototype.presignedGetObject = mockPresignedGetObject;

// Mock segnalazioneModel
const segnalazioneModel = require('../models/segnalazione');
let mockFind = jest.fn()
    .mockResolvedValueOnce([
        new segnalazioneModel({
            id: 123,
            luogo: '45,11',
            foto: 'http://example.com/1234',
            tipo: 'rifiuti',
            urgenza: 'bassa',
            status: 'aperta'
        }),
        new segnalazioneModel({
            id: 124,
            luogo: '45,11',
            foto: 'http://example.com/5678',
            tipo: 'illuminazione',
            urgenza: 'alta',
            status: 'conclusa'
        })])
    .mockRejectedValueOnce(new Error('Segnalazioni not found'));
segnalazioneModel.findAll = mockFind;

let mockFindById = jest.fn()
    .mockResolvedValueOnce(new segnalazioneModel({
        id: 123,
        luogo: '45,11',
        foto: 'http://example.com/1234',
        tipo: 'rifiuti',
        urgenza: 'bassa',
        status: 'aperta'
    }))
    .mockRejectedValueOnce(new Error('Segnalazione not found'));
segnalazioneModel.findById = mockFindById;

// Create a valid token
const token_secret = process.env.SUPER_SECRET || "supersecret";
var token = jwt.sign({ email: 'mobile@test.com', id: "6635ed27332aa85d3e6453ac" },
    token_secret, { expiresIn: "1y" });

// Drop all collections in the test database
// async function dropAllCollections() {
//     const collections = Object.keys(mongoose.connection.collections);
//     for (const collectionName of collections) {
//         const collection = mongoose.connection.collections[collectionName];
//         try {
//             await collection.drop();
//         } catch (error) {
//             // This error happens when you try to drop a collection that's already dropped. Happens infrequently. 
//             // Safe to ignore. 
//             if (error.message === 'ns not found') return;

//             // This error happens when you use it.todo.
//             // Safe to ignore. 
//             if (error.message.includes('a background operation is currently running')) return;

//             console.log(error.message);
//         }
//     }
// }

beforeAll(async () => {
    jest.setTimeout(8000);
    // await mongoose.connect(process.env.MONGODB_URI_TEST);
});

afterAll(async () => {
    // await dropAllCollections();
    // mongoose.connection.close();
});

describe('POST /api/v1/segnalazioni/immagini: Caricamento di un\'immagine', () => {
    test("Nessuna immagine fornita", () => {
        return request(app)
            .post('/api/v1/segnalazioni/immagini')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "No image provided" });
    });

    test("Immagine caricata con successo", () => {
        return request(app)
            .post('/api/v1/segnalazioni/immagini')
            .set('x-access-token', token)
            .attach('image', `${__dirname}/smile.png`)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.imageKey).toBeDefined();
            });
    });

    test("Caricamento dell'immagine fallito", () => {
        return request(app)
            .post('/api/v1/segnalazioni/immagini')
            .set('x-access-token', token)
            .attach('image', `${__dirname}/smile.png`)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(500, { success: false, error: "Error uploading image" });
    });
});

describe('GET /api/v1/segnalazioni/immagini/:id: Download di un\'immagine', () => {
    test("Generazione del link con successo", () => {
        return request(app)
            .get('/api/v1/segnalazioni/immagini/1234')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.imageUrl).toBeDefined();
            });
    });

    test("Problema nella generazione del link", () => {
        return request(app)
            .get('/api/v1/segnalazioni/immagini/1234')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(500, { success: false, error: "Error retrieving image" });
    });
});

describe('GET /api/v1/segnalazioni: Lettura di tutte le segnalazioni', () => {
    test("Richiesta con successo", () => {
        return request(app)
            .get('/api/v1/segnalazioni')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.segnalazioni).toBeDefined();
                expect(res.body.segnalazioni.length).toBe(2);
            });
    });

    test("Nessuna segnalazione trovata", () => {
        return request(app)
            .get('/api/v1/segnalazioni')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404, { success: false, error: "Segnalazioni not found" });
    });
});

describe('GET /api/v1/segnalazioni/:id: Lettura di una segnalazione', () => {
    test("Richiesta con successo", () => {
        return request(app)
            .get('/api/v1/segnalazioni/123')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.segnalazione).toBeDefined();
            });
    });

    test("Segnalazione non trovata", () => {
        return request(app)
            .get('/api/v1/segnalazioni/123')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404, { success: false, error: "Segnalazione not found" });
    });
});
