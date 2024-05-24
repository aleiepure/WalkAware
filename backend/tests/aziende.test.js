const app = require('../app');
const jwt = require('jsonwebtoken');
const request = require('supertest');

require('dotenv').config();

// Mock utenteMobile
const UtenteWebModel = require('../models/utente_web');
let mockUtenteWebFindOne = jest.fn()
    .mockResolvedValueOnce();
UtenteWebModel.findOne = mockUtenteWebFindOne;

// Mock aziendaModel
const AziendaModel = require('../models/azienda');
let mockAziendaFindOne = jest.fn()
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(new AziendaModel({
        nome: "azienda1",
        p_iva: "1",
        email: "azienda1@test.com",
        password: "passwordAzienda"
    }))
    .mockRejectedValueOnce(new Error('Problem retrieving aziende'));
AziendaModel.findOne = mockAziendaFindOne;

let mockAziendaFind = jest.fn()
    .mockResolvedValueOnce([
        new AziendaModel({
            nome: "azienda1",
            p_iva: "1",
            email: "azienda1@test.com",
            password: "passwordAzienda"
        }),
        new AziendaModel({
            nome: "azienda2",
            p_iva: "2",
            email: "azienda2@test.com",
            password: "passwordAzienda"
        }),
    ])
    .mockResolvedValueOnce([])
    .mockRejectedValueOnce(new Error('Problem retrieving aziende'));
AziendaModel.find = mockAziendaFind;

let mockAziendaFindById = jest.fn()
    .mockResolvedValueOnce(new AziendaModel({
        nome: "azienda1",
        p_iva: "1",
        email: "azienda@test.com",
        password: "passwordAzienda",
        _id: "1234"
    }))
    .mockRejectedValueOnce(new Error('Azienda not found'))
    .mockResolvedValueOnce(new AziendaModel({
        nome: "azienda1",
        p_iva: "1",
        email: "azienda@test.com",
        password: "passwordAzienda",
        _id: "1234"
    }))
    .mockRejectedValueOnce(new Error('Azienda not found'))
    .mockResolvedValueOnce(new AziendaModel({//modifica azienda richiesta valida
        nome: "azienda1",
        p_iva: "1",
        email: "azienda@test.com",
        password: "passwordAzienda",
        _id: "1234"
    })) 
    .mockRejectedValueOnce() //modifica azienda: azienda non trovata
AziendaModel.findById = mockAziendaFindById;

let mockAziendaSave = jest.fn()
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(true)
AziendaModel.prototype.save = mockAziendaSave;

// Mock premioModel
const PremioModel = require('../models/premio');
let mockPremioSave = jest.fn()
    .mockResolvedValueOnce(true);
PremioModel.prototype.save = mockPremioSave;

// Create a valid token
const token_secret = process.env.SUPER_SECRET || "supersecret";
token = jwt.sign({ email: 'web@gmail.com', id: "663f3d024fe06d9a59e95d30" },
    token_secret, { expiresIn: "1y" });

afterAll(async () => {
    jest.restoreAllMocks();
});

describe("POST /api/v1/aziende: Registrazione di una nuova azienda", () => {
    test("Richiesta valida", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                email: "azienda@test.com",
                password: "passwordAzienda"
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.headers).toHaveProperty("location");
                expect(res.headers.location).toBeDefined();
            });
    });

    test("Azienda già esistente", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                email: "azienda@test.com",
                password: "passwordAzienda"
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: 'An azienda with the same email already exists.' });
    });

    test("Problema nel leggere le aziende", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                email: "azienda@test.com",
                password: "passwordAzienda"
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(500, { success: false, error: "Problem retrieving aziende" });
    });

    test("Email in un formato non valido", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                email: "aziendatest.com",
                password: "passwordAzienda"
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect((400), { success: false, error: "The 'email' field must be a non-empty string in email format." });
    });

    test("Campo nome non fornito", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .send({
                p_iva: "315134523452",
                email: "azienda@test.com",
                password: "passwordAzienda"
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect((400), { success: false, error: "The 'nome' field must be a non-empty string." });
    });

    test("Tipo del campo p_iva diverso da stringa", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .send({
                nome: "aziendaName",
                p_iva: 315134523452,
                email: "azienda@test.com",
                password: "passwordAzienda"
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect((400), { success: false, error: "The 'p_iva' field must be a string." });
    });

    test("Campo password non fornito", () => {
        return request(app)
            .post("/api/v1/aziende")
            .set('x-access-token', token)
            .send({
                nome: "aziendaName",
                p_iva: "315134523452",
                email: "azienda@test.com"
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect((400), { success: false, error: 'The "password" field must be a non-empty string.' });
    });
});

describe("GET /api/v1/aziende: Lettura di tutte le aziende", () => {
    test("Richiesta con risultati", () => {
        return request(app)
            .get("/api/v1/aziende")
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.body).toHaveProperty("aziende");
                expect(res.body.aziende).toBeInstanceOf(Array);
                expect(res.body.aziende.length).toBeGreaterThan(0);
                expect(res.body.aziende[0]).toHaveProperty("nome");
                expect(res.body.aziende[0]).toHaveProperty("p_iva");
                expect(res.body.aziende[1]).toHaveProperty("email");
                expect(res.body.aziende[1]).toHaveProperty("password");
            });
    });

    test("Richiesta senza risultati", () => {
        return request(app)
            .get("/api/v1/aziende")
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.body).toHaveProperty("aziende");
                expect(res.body.aziende).toBeInstanceOf(Array);
                expect(res.body.aziende.length).toBe(0);
            });
    });

    test("Problema nel leggere le aziende", () => {
        return request(app)
            .get("/api/v1/aziende")
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(500, { success: false, error: "Problem retrieving aziende" });
    });
});

describe("GET /api/v1/aziende/:id: Lettura di un'azienda", () => {
    test("Azienda trovata", () => {
        return request(app)
            .get("/api/v1/aziende/1234")
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.body).toHaveProperty("azienda");
                expect(res.body.azienda).toHaveProperty("nome");
                expect(res.body.azienda).toHaveProperty("p_iva");
                expect(res.body.azienda).toHaveProperty("email");
                expect(res.body.azienda).toHaveProperty("password");
            });
    });

    test("Azienda non trovata", () => {
        return request(app)
            .get("/api/v1/aziende/1234")
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404, { success: false, error: "Azienda not found" });
    });
});

describe("POST /api/v1/aziende/:id/premi: Aggiunta di un premio a un'azienda", () => {
    test('Richiesta valida', () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                nome: "premioName",
                valore: 10,
                tipo: "percentuale",
                descrizione: "descrizione",
                costo_punti: 1000,
                idAzienda: "azienda",
                validitaBuono: 30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.headers).toHaveProperty("location");
                expect(res.headers.location).toBeDefined();
            });
    });

    test("Azienza non trovata", () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                nome: "premioName",
                valore: 10,
                tipo: "percentuale",
                descrizione: "descrizione",
                costo_punti: 1000,
                idAzienda: "azienda",
                validitaBuono: 30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404, { success: false, error: "Azienda not found" });
    });

    test("Campo nome non fornito", () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                valore: 10,
                tipo: "percentuale",
                descrizione: "descrizione",
                costo_punti: 1000,
                idAzienda: "azienda",
                validitaBuono: 30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "The 'nome' field must be a non-empty string." });
    });

    test("Campo valore fornito come stringa", () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                nome: "premioName",
                valore: "10",
                tipo: "percentuale",
                descrizione: "descrizione",
                costo_punti: 1000,
                idAzienda: "azienda",
                validitaBuono: 30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "The 'valore' field must be a positive number." });
    });

    test("Campo tipo contenente una stringa diversa da quelle attese", () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                nome: "premioName",
                valore: 10,
                tipo: "invalid",
                descrizione: "descrizione",
                costo_punti: 1000,
                idAzienda: "azienda",
                validitaBuono: 30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "The 'tipo' field must be either 'percentuale', 'contante', 'omaggio' or 'quantità'." });
    });

    test("Campo descrizione non fornito", () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                nome: "premioName",
                valore: 10,
                tipo: "percentuale",
                costo_punti: 1000,
                idAzienda: "azienda",
                validitaBuono: 30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "The 'descrizione' field must be a non-empty string." });
    });

    test("Campo costo_punti fornito come stringa", () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                nome: "premioName",
                valore: 10,
                tipo: "percentuale",
                descrizione: "descrizione",
                costo_punti: "1000",
                idAzienda: "azienda",
                validitaBuono: 30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "The 'costo_punti' field must be a positive number." });
    });

    test("Campo idAzienda non fornito", () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                nome: "premioName",
                valore: 10,
                tipo: "percentuale",
                descrizione: "descrizione",
                costo_punti: 1000,
                validitaBuono: 30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "The 'idAzienda' field must be a non-empty string." });
    });

    test("Campo validità buono numero negativo", () => {
        return request(app)
            .post('/api/v1/aziende/1234/premi')
            .set('x-access-token', token)
            .send({
                nome: "premioName",
                valore: 10,
                tipo: "percentuale",
                descrizione: "descrizione",
                costo_punti: 1000,
                idAzienda: "azienda",
                validitaBuono: -30
            })
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, { success: false, error: "The 'validitaBuono' field must be a positive number." });
    });
});

//test modifica dati azienda

describe("PUT /api/v1/aziende/{id}: modifica dati azienda", ()=>{
    test("Richiesta valida", ()=>{
        return request(app)
            .put(`/api/v1/aziende/12345`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "newAziendaEmail@test.com",
                p_iva: "987654321"
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true)
            });
    })
    test("Azienda non trovata", ()=>{
        return request(app)
            .put(`/api/v1/aziende/7890`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "newAziendaEmail@test.com",
                p_iva: "987654321"
            })
            .expect(404, { success: false, error: 'Azienda not found' })
    })
    test("Email non valida", ()=>{
        return request(app)
            .put(`/api/v1/aziende/7890`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "",
                p_iva: "987654321"
            })
            .expect(400, { success: false, error: "The 'email' field must be a non-empty string in email format." })
    })
    test("P.IVA non valida", ()=>{
        return request(app)
            .put(`/api/v1/aziende/7890`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "newAziendaEmail@test.com",
                p_iva: 1234567
            })
            .expect(400, { success: false, error: "The 'p_iva' field must be a non-empty string." })
    })
    
})