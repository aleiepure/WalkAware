const app = require('../app');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const mongoose = require('mongoose');


const buonoModel = require('../models/buono');
const { utenteMobileModel } = require('../models/utente_mobile.js');

require('dotenv').config();

const token_secret = process.env.SUPER_SECRET || "supersecret";
token = jwt.sign({ email: 'azienda1@email.com', id: "664b3477a8736986e67dc3f3" },
    token_secret, { expiresIn: "1y" });

// Mock buonoModel
buonoId = new mongoose.Types.ObjectId();
let mockFindOne = jest.fn()
    .mockResolvedValueOnce(new buonoModel({ // PUT richiesta valida
        id_utente: "1234",
        id_buono: buonoId,
        nome: "Buono1",
        valore: 10,
        tipo: "percentuale",
        descrizione: "Buono sconto 10%",
        costo_punti: 100,
        idAzienda: "Azienda1",
        validitaBuono: 30,
        data_riscatto: new Date(),
        usato: false
    }))
    .mockResolvedValueOnce(new buonoModel({ // PUT buono già usato
        id_utente: "1234",
        id_buono: buonoId,
        nome: "Buono1",
        valore: 10,
        tipo: "percentuale",
        descrizione: "Buono sconto 10%",
        costo_punti: 100,
        idAzienda: "Azienda1",
        validitaBuono: 30,
        data_riscatto: new Date(),
        usato: true
    }))
    .mockResolvedValueOnce(new buonoModel({ // PUT buono scaduto
        id_utente: "1234",
        id_buono: buonoId,
        nome: "Buono1",
        valore: 10,
        tipo: "percentuale",
        descrizione: "Buono sconto 10%",
        costo_punti: 100,
        idAzienda: "Azienda1",
        validitaBuono: 30,
        data_riscatto: new Date('1970-01-01'),
        usato: false
    }))
    .mockRejectedValueOnce(new Error('Buono non trovato con l\'ID specificato')) // PUT buono non trovato
    .mockResolvedValueOnce(new buonoModel({ // GET richiesta valida
        id_utente: "1234",
        id_buono: buonoId,
        nome: "Buono1",
        valore: 10,
        tipo: "percentuale",
        descrizione: "Buono sconto 10%",
        costo_punti: 100,
        idAzienda: "Azienda1",
        validitaBuono: 30,
        data_riscatto: new Date(),
        usato: false
    }))
    .mockRejectedValueOnce(new Error('Buono non trovato con l\'ID specificato'));
buonoModel.findOne = mockFindOne;


// mock utente buono
let mockFindById = jest.fn()
    .mockResolvedValueOnce(new utenteMobileModel({ // PUT richiesta valida
        nome: "utente",
        eta: "99",
        email: "utente@mobile.com",
        password: "123",
        punti: 1000,
        buoni: [{
            _id: buonoId,
            nome: "Buono1",
            valore: 10,
            tipo: "percentuale",
            descrizione: "Buono sconto 10%",
            costo_punti: 100,
            idAzienda: "Azienda1",
            validitaBuono: 30,
            data_riscatto: new Date(),
            usato: false
        }],
        segnalazioni: []
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ // PUT buono già usato
        nome: "utente",
        eta: "99",
        email: "utente@mobile.com",
        password: "123",
        punti: 1000,
        buoni: [{
            _id: buonoId,
            nome: "Buono1",
            valore: 10,
            tipo: "percentuale",
            descrizione: "Buono sconto 10%",
            costo_punti: 100,
            idAzienda: "Azienda1",
            validitaBuono: 30,
            data_riscatto: new Date(),
            usato: true
        }],
        segnalazioni: []
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ // PUT buono scaduto
        nome: "utente",
        eta: "99",
        email: "utente@mobile.com",
        password: "123",
        punti: 1000,
        buoni: [{
            _id: buonoId,
            nome: "Buono1",
            valore: 10,
            tipo: "percentuale",
            descrizione: "Buono sconto 10%",
            costo_punti: 100,
            idAzienda: "Azienda1",
            validitaBuono: 30,
            data_riscatto: new Date('1970-01-01'),
            usato: false
        }],
        segnalazioni: []
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ // GET richiesta valida
        nome: "utente",
        eta: "99",
        email: "utente@mobile.com",
        password: "123",
        punti: 1000,
        buoni: [{
            _id: buonoId,
            nome: "Buono1",
            valore: 10,
            tipo: "percentuale",
            descrizione: "Buono sconto 10%",
            costo_punti: 100,
            idAzienda: "Azienda1",
            validitaBuono: 30,
            data_riscatto: new Date(),
            usato: false
        }],
        segnalazioni: []
    }));

utenteMobileModel.findById = mockFindById;


// mock save
let mockSave = jest.fn()
    .mockResolvedValue(true);
buonoModel.prototype.save = mockSave;
utenteMobileModel.prototype.save = mockSave;

afterAll(async () => {
    jest.restoreAllMocks();
});

describe('PUT /api/v1/buoni/:id/valida: Validazione di un buono', () => {
    test('Richiesta valida', () => {
        return request(app)
            .put('/api/v1/buoni/123/valida')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, { success: true, usato: true });
    });

    test('Buono già utilizzato', () => {
        return request(app)
            .put('/api/v1/buoni/123/valida')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "Buono già utilizzato" });
    });

    test('Buono scaduto', () => {
        return request(app)
            .put('/api/v1/buoni/123/valida')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "Buono scaduto" });
    });

    test('Buono non trovato', () => {
        return request(app)
            .put('/api/v1/buoni/123/valida')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404, { success: false, error: 'Buono non trovato con l\'ID specificato' });
    });
});

describe('GET /api/v1/buoni/:id: Recupero di un buono', () => {
    test('Buono trovato', () => {
        return request(app)
            .get('/api/v1/buoni/123')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.buoni).toEqual({
                    _id: expect.any(String),
                    nome: "Buono1",
                    valore: 10,
                    tipo: "percentuale",
                    descrizione: "Buono sconto 10%",
                    costo_punti: 100,
                    idAzienda: "Azienda1",
                    validitaBuono: 30,
                    data_riscatto: expect.any(String),
                    usato: false
                });
            });
    });
    test('Buono non trovato', () => {
        return request(app)
            .get('/api/v1/buoni/123')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404, { success: false, error: 'Buono non trovato con l\'ID specificato' });
    });
});