const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const request = require('supertest');
require('dotenv').config();

const premioModel = require('../models/premio.js');



let mockPremioFind = jest.fn()
    .mockResolvedValueOnce(new premioModel({ //get premi valido
        nome: "premioNome",
        valore: 23,
        tipo: "percentuale",
        descrizione: "premioDescrizione",
        costo_punti: 10,
        idAzienda: "premioIdAzienda",
        validitaBuono: 50
    }))
    .mockRejectedValueOnce(); //premi not found

premioModel.find = mockPremioFind;

// Create a valid token
const token_secret = process.env.SUPER_SECRET || "supersecret";
token = jwt.sign({ email: 'web@gmail.com', id: "663f3d024fe06d9a59e95d30" },
    token_secret, { expiresIn: "1y" });


afterAll(async () => {
    jest.restoreAllMocks();
});


describe("GET /api/v1/premi: ritorna una lista di premi", () => {
    test("Richesta valida", () => {
        return request(app)
            .get(`/api/v1/premi`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.premi).toBeDefined()
            });
    });
    test("Premi not found", () => {
        return request(app)
            .get(`/api/v1/premi`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(404, { success: false, error: "Premi not found" });
    });
});