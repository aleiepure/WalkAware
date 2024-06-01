const app = require('../app');
const jwt = require('jsonwebtoken');
const request = require('supertest');

require('dotenv').config();
const { utenteMobileModel, buonoUtenteMobileModel } = require('../models/utente_mobile.js');
const premioModel = require('../models/premio.js');
const buonoModel = require("../models/buono");



// Mock utenteMobile

let mockUtenteMobileFindOne = jest.fn()
    .mockResolvedValueOnce(false) //registrazione valida
    .mockResolvedValueOnce(new utenteMobileModel({ //registrazione utente esiste già
        nome: "Luigi Bianchi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1000,
        buoni: [],
        segnalazioni: []
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //login valido
        nome: "Mario Rossi",
        email: "lamiaemail@gmail.com",
        password: "password123",
        eta: 34
    }))
    .mockResolvedValueOnce(null) //utente login non trovato
    .mockResolvedValueOnce(new utenteMobileModel({ //password sbagliata login
        nome: "Luigi Bianchi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1000,
        buoni: [],
        segnalazioni: []
    }));
utenteMobileModel.findOne = mockUtenteMobileFindOne;

let mockUtenteMobileSave = jest.fn()
    .mockResolvedValueOnce(true);
utenteMobileModel.prototype.save = mockUtenteMobileSave;

let mockBuonoModel = jest.fn()
    .mockResolvedValueOnce(true);
buonoModel.prototype.save = mockBuonoModel;

let mockUtenteMobileFindById = jest.fn()
    .mockResolvedValueOnce(new utenteMobileModel({ //get punti valida
        nome: "Luigi Bianchi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1000,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(null) //get punti non valida
    .mockResolvedValueOnce(new utenteMobileModel({ //put punti valida
        nome: "Luigi Bianchi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1000,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(null) //put punti non valida
    .mockResolvedValueOnce(new utenteMobileModel({ //get utente mobile con id valida
        nome: "Luigi Bianchi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1000,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(null) //get utente mobile con id non valida
    .mockResolvedValueOnce(new utenteMobileModel({ //richiesta valida riscattaBuono
        nome: "Luigi Bianchi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1000,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //not enough punti
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockRejectedValueOnce() // utente not found riscattaBuono
    .mockResolvedValueOnce() //premio not found
    .mockResolvedValueOnce(new utenteMobileModel({ //modifica utente valida
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //modifica utente nome non stringa
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //modifica utente nome uguale a quello attuale
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //modifica utente email non valida
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //modifica utente email uguale a quella attuale
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //modifica utente password non valida
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //modifica utente password uguale a quella attuale
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockResolvedValueOnce(new utenteMobileModel({ //modifica utente password vecchia non fornita
        nome: "Mario Rossi",
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [],
        segnalazioni: [],
    }))
    .mockRejectedValueOnce(new Error('Utente not found'));  // modifica utente, utente non trovato
    .mockResolvedValueOnce() // premio not found
    .mockResolvedValueOnce(new utenteMobileModel({ // get buoni utente trovato
        eta: 44,
        email: "mobile@test.com",
        password: "password123",
        punti: 1,
        buoni: [
            new buonoUtenteMobileModel({
                nome: "buonoNome",
                valore: 23,
                tipo: "percentuale",
                descrizione: "buonoDescrizione",
                validitaBuono: 50,
                costo_punti: 10,
            }),
        ],
        segnalazioni: [],
    }))
    .mockRejectedValueOnce();   // get buoni utente non trovato
utenteMobileModel.findById = mockUtenteMobileFindById;

// mock premio model
const premioModel = require('../models/premio.js');
let mockPremioFindById = jest.fn()
    .mockResolvedValueOnce(new premioModel({ //richiesta valida riscattaBuono
        nome: "premioNome",
        valore: 23,
        tipo: "percentuale",
        descrizione: "premioDescrizione",
        costo_punti: 10,
        idAzienda: "premioIdAzienda",
        validitaBuono: 50
    }))
    .mockResolvedValueOnce(new premioModel({ //not enough punti
        nome: "premioNome",
        valore: 23,
        tipo: "percentuale",
        descrizione: "premioDescrizione",
        costo_punti: 10,
        idAzienda: "premioIdAzienda",
        validitaBuono: 50
    }))
    .mockResolvedValueOnce()// utente not found riscattaBuono
    .mockRejectedValueOnce();// premio not found riscattaBuono
premioModel.findById = mockPremioFindById;

// Create a valid token
const token_secret = process.env.SUPER_SECRET || "supersecret";
token = jwt.sign({ email: 'web@gmail.com', id: "663f3d024fe06d9a59e95d30" },
    token_secret, { expiresIn: "1y" });


afterAll(() => {
    jest.restoreAllMocks();
});


describe("POST /api/v1/utente/mobile: Registrazione di un utente", () => {
    test("Richiesta valida", () => {
        return request(app)
            .post("/api/v1/utente/mobile")
            .set('Accept', 'application/json')
            .send({
                nome: "Mario Rossi",
                email: "lamiaemail@gmail.com",
                password: "password123",
                eta: 34
            })
            .expect(201, { success: true })
            .expect((res) => {
                expect(res.headers.location).toBeDefined();
                expect(res.body.success).toBe(true);
            });
    });

    test("L'utente esiste già", () => {
        return request(app)
            .post("/api/v1/utente/mobile")
            .send({
                nome: "Mario Rossi",
                email: "mobile@test.com",
                password: "supersecret1",
                eta: 44
            })
            .expect(400, { success: false, error: "A mobile user with the same email already exists." });
    });

    test("Email in un formato non valido", () => {
        return request(app)
            .post("/api/v1/utente/mobile")
            .set('Accept', 'application/json')
            .send({
                nome: "Mario Rossi",
                email: "lamiaemail",
                password: "password123",
                eta: 34
            })
            .expect(400, { success: false, error: "The 'email' field must be a non-empty string in email format." });
    });

    test("Età inferiore ai 18 anni", () => {
        return request(app)
            .post("/api/v1/utente/mobile")
            .set('Accept', 'application/json')
            .send({
                nome: "Mario Rossi",
                email: "lamiaemail@gmail.com",
                password: "password123",
                eta: 15
            })
            .expect(400, { success: false, error: "The 'eta' field must be a number greater than 18." });
    });

    test("La password deve essere una stringa non vuota", () => {
        return request(app)
            .post("/api/v1/utente/mobile")
            .set('Accept', 'application/json')
            .send({
                nome: "Mario Rossi",
                email: "lamiaemail@gmail.com",
                password: "",
                eta: 34
            })
            .expect(400, { success: false, error: "The 'password' field must be a non-empty string" });
    });
});

describe("POST api/v1/utente/mobile/login: Login utente mobile", () => {
    test("Login valido", () => {
        return request(app)
            .post("/api/v1/utente/mobile/login")
            .set('Accept', 'application/json')
            .send({
                email: "mobile@test.com",
                password: "password123"
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.token).toBeDefined();
            });
    });

    test("Utente non trovato", () => {
        return request(app)
            .post("/api/v1/utente/mobile/login")
            .set('Accept', 'application/json')
            .send({
                email: "nonesistocomeuser@test.com",
                password: "password123"
            })
            .expect(401, { success: false, error: 'Authentication failed. User not found.' });
    });

    test("Password scorretta", () => {
        return request(app)
            .post("/api/v1/utente/mobile/login")
            .set('Accept', 'application/json')
            .send({
                email: "mobile@test.com",
                password: "mistero"
            })
            .expect(401, { success: false, error: 'Authentication failed. Incorrect password.' });
    });

    test("Campo email vuoto", () => {
        return request(app)
            .post("/api/v1/utente/mobile/login")
            .set('Accept', 'application/json')
            .send({
                email: "",
                password: "password123"
            })
            .expect(400, { success: false, error: "The 'email' field must be a non-empty string in email format." });
    });

    test("Campo password vuoto", () => {
        return request(app)
            .post("/api/v1/utente/mobile/login")
            .set('Accept', 'application/json')
            .send({
                email: "mobile@test.com",
                password: ""
            })
            .expect(400, { success: false, error: "The 'password' field must be a non-empty string." });
    });
});

describe('GET /api/v1/utente/mobile/:id/punti: Ottenere i punti di un utente', () => {
    test('Richiesta valida', async () => {
        return request(app)
            .get(`/api/v1/utente/mobile/12345/punti`)
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

    test('ID inesistente', async () => {
        return request(app)
            .get(`/api/v1/utente/mobile/InvalidIdInvalidId/punti`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(404, { success: false, error: 'User not found with the specified ID.' });
    });
});

describe('PUT /api/v1/utente/mobile/:id/punti: Aggiornamento dei punti di un utente', () => {
    test('Richiesta valida', async () => {
        return request(app)
            .put(`/api/v1/utente/mobile/12345/punti`)
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

    test('Punti forniti in modo errato', async () => {
        return request(app)
            .put(`/api/v1/utente/mobile/12345/punti`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                punti: "not a number"
            })
            .expect(400, { success: false, error: "The 'punti' field must be a number" });
    });

    test('Punti non forniti', async () => {
        return request(app)
            .put(`/api/v1/utente/mobile/12345/punti`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(400, { success: false, error: "The 'punti' field must be a number" });
    });

    test('ID inesistente', async () => {
        return request(app)
            .put('/api/v1/utente/mobile/InvalidIDInvalidID/punti')
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                punti: 1000
            })
            .expect(404, { success: false, error: 'User not found with the specified ID.' });
    });
});

describe("GET /api/v1/utente/mobile/:id: Ottiene un utente", () => {
    test('Richiesta valida', async () => {
        return request(app)
            .get(`/api/v1/utente/mobile/12345`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.body).toHaveProperty("nome");
                expect(res.body).toHaveProperty("email");
                expect(res.body).toHaveProperty("eta");
                expect(res.body).toHaveProperty("punti");
                expect(res.body.nome).toBeDefined();
                expect(res.body.email).toBeDefined();
                expect(res.body.eta).toBeDefined();
                expect(res.body.punti).toBeDefined();
            });
    });
    test('Utente non trovato', async () => {
        return request(app)
            .get("/api/v1/utente/mobile/12345")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(404, { success: false, error: 'User not found with the specified ID.' });

    });

});

describe("POST api/v1/utente/mobile/{id}/riscattaBuono: Riscatta un premio", () => {
    test("Richiesta valida", async () => {
        return request(app)
            .post("/api/v1/utente/mobile/12345/riscattaBuono?premioId=12345")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.headers.location).toBeDefined();
            });
    });
    test("not enough punti", async () => {
        return request(app)
            .post("/api/v1/utente/mobile/12345/riscattaBuono?premioId=12345")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .expect(400, { success: false, error: 'Not enough points to redeem the prize.' });

    });
    test("utente not found", async () => {
        return request(app)
            .post("/api/v1/utente/mobile/12345/riscattaBuono?premioId=12345")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .expect(404, { success: false, error: 'User not found with the specified ID.' });
    });
    test("premio not found", async () => {
        return request(app)
            .post("/api/v1/utente/mobile/12345/riscattaBuono?premioId=12345")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .expect(404, { success: false, error: 'Prize not found with the specified ID.' });
    });
    test("empty query parameter", async () => {
        return request(app)
            .post("/api/v1/utente/mobile/12345/riscattaBuono")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .expect(400, { success: false, error: "The 'premioId' query parameter must be a non-empty string." });
    });
});

describe("GET api/v1/utente/mobile/:id/buoni: Ottieni tutti i buoni dell'utente", () => {
    test("Utente trovato", () => {
        return request(app)
            .get("/api/v1/utente/mobile/12345/buoni")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty("success");
                expect(res.body.success).toBe(true);
                expect(res.body).toHaveProperty("buoni");
                expect(res.body.buoni).toBeDefined();
                expect(Array.isArray(res.body.buoni)).toBe(true);
            });
    });

    test("Utente non trovato", () => {
        return request(app)
            .get("/api/v1/utente/mobile/12345/buoni")
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(404, { success: false, error: 'User not found with the specified ID.' });
    });
});
