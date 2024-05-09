const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const request = require('supertest');
require('dotenv').config();

const { utenteMobileModel } = require('../models/utente_mobile.js');
let userSpyFindById;
beforeAll(async () => {
    jest.setTimeout(8000);
    userSpyFindById = jest.spyOn(utenteMobileModel, "findById")
        .mockImplementation((id) => {
            if (id == "6635ed27332aa85d3e6453ac") {
                return Promise.resolve({ // Utilizzo di Promise.resolve()
                    nome: "mario",
                    eta: "21",
                    email: "mobile@test.com",
                    password: "123",
                    punti: 1000,
                    buoni: [],
                    segnalazioni: [],
                    save: userSpySave
                });
            } else return Promise.reject(new Error('User not found'));
        });
    userSpySave = jest.fn().mockResolvedValue();
});
afterAll(() => { userSpyFindById.mockRestore();userSpySave.mockRestore()});

// create a valid token
var token = jwt.sign({ email: 'mobile@test.com', id: "6635ed27332aa85d3e6453ac" },
    process.env.SUPER_SECRET, { expiresIn: "1y" });
afterAll(() => { mongoose.connection.close(true); });

const token_secret = process.env.SUPER_SECRET || "supersecret";

describe('GET /api/v1/utente/mobile/:id/punti', () => {
    // create a valid token
    var token = jwt.sign({ email: 'mobile@test.com', id: "6635ed27332aa85d3e6453ac" },
        token_secret, { expiresIn: "1y" });


describe('GET /api/v1/utente/mobile/:id/punti', () => {

    test('GET /api/v1/utente/mobile/:id/punti Valid request of punti', async () => {
        return request(app)
            .get('/api/v1/utente/mobile/6635ed27332aa85d3e6453ac/punti')
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.punti).toBeDefined();
                expect(typeof res.body.punti).toBe('number');
                expect(res.body.punti).toBe(1000); 
            });
    });
    
        test('GET /api/v1/utente/mobile/:id/punti Get punti, wrong id', async () => {
            return request(app).get('/api/v1/utente/mobile/InvlidIDInvlaidID/punti')
                .set('x-access-token', token)
                .set('Accept', 'application/json')
                .expect(404, { success: false, error: 'User not found with the specified ID.' })
        });
})


describe('PUT /api/v1/utente/mobile/:id/punti', () => {
    // create a valid token
    var token = jwt.sign({ email: 'mobile@test.com', id: "6635ed27332aa85d3e6453ac" },
        token_secret, { expiresIn: "1y" });

    test('PUT /api/v1/utente/mobile/:id/punti Valid Request', async () => {
        return request(app)
            .put('/api/v1/utente/mobile/6635ed27332aa85d3e6453ac/punti')
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                punti: 5000
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.punti).toBeDefined();
                expect(typeof res.body.punti).toBe('number');
                expect(res.body.punti).toBe(5000);
            });
    });

    test('PUT /api/v1/utente/mobile/:id/punti Invalid punti', async () => {
        return request(app)
            .put('/api/v1/utente/mobile/6635ed27332aa85d3e6453ac/punti')
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                punti: "not a number"
            })
            .expect(400, { success: false, error: "The 'punti' field must be a number" })
    });

    test('PUT /api/v1/utente/mobile/:id/punti Missing punti', async () => {
        return request(app)
            .put('/api/v1/utente/mobile/6635ed27332aa85d3e6453ac/punti')
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(400, { success: false, error: "The 'punti' field must be a number" })
    });

    test('PUT /api/v1/utente/mobile/:id/punti invalid ID', async () => {
        return request(app)
            .put('/api/v1/utente/mobile/InvalidIDInvalidID/punti')
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                punti: 1000
            })
            .expect(404, { success: false, error: 'User not found with the specified ID.' })
    });

})


