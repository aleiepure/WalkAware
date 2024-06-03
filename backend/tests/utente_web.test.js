const app = require('../app');
const jwt = require('jsonwebtoken');
const request = require('supertest');
require('dotenv').config();

// Mock mockFindOne
const utenteWebModel = require('../models/utente_web.js');
let mockFindOne = jest.fn()
    .mockResolvedValueOnce(new utenteWebModel({ // Login valido (91)
        nome: "Franco",
        email: "web@test.com",
        password: "password456"
    }))
    .mockResolvedValueOnce(null)   // Email sbagliata (91)
    .mockResolvedValueOnce(new utenteWebModel({ // Password sbagliata (91)
        nome: "Franco",
        email: "web@test.com",
        password: "password456"
    }))
    .mockResolvedValueOnce(null) // Registrazione valida (43)
    .mockResolvedValueOnce(new utenteWebModel({ // Email già in uso (43)
        nome: "Franco",
        email: "web@test.com",
        password: "password456"
    }));
utenteWebModel.findOne = mockFindOne;

// Mock mockFindById
let mockFindById = jest.fn()
    .mockResolvedValueOnce(new utenteWebModel({ // get utente by id valido
        id: 123,
        nome: "Franco",
        email: "web@test.com",
        password: "password456",
        supporto_tecnico: true
    }))
    .mockRejectedValueOnce() // get utente by id failed
    .mockResolvedValueOnce(new utenteWebModel({ // PUT utente valido
        id: 123,
        nome: "Franco",
        email: "web@test.com",
        password: "password456",
        supporto_tecnico: true
    }))
    .mockRejectedValueOnce() // Put utente non valido
    .mockResolvedValueOnce(new utenteWebModel({ // PUT wrong old password
        id: 123,
        nome: "Franco",
        email: "web@test.com",
        password: "password456",
        supporto_tecnico: true
    }))
    .mockResolvedValueOnce(new utenteWebModel({ // PUT 2 password do not match
        id: 123,
        nome: "Franco",
        email: "web@test.com",
        password: "password456",
        supporto_tecnico: true
    }));
utenteWebModel.findById = mockFindById;


// mock save prototype
let mockSave = jest.fn()
    .mockResolvedValueOnce();
utenteWebModel.prototype.save = mockSave;

// Create a valid token
const token_secret = process.env.SUPER_SECRET || "supersecret";
token = jwt.sign({ email: 'web@gmail.com', id: "663f3d024fe06d9a59e95d30" },
    token_secret, { expiresIn: "1y" });

afterAll(async () => {
    jest.restoreAllMocks();
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

describe("POST /api/v1/utente/web: Registrazione utente webapp", () => {
    test("Registrazione valida", () => {
        return request(app)
            .post("/api/v1/utente/web")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send({
                email: "web@test.com",
                password: "password456",
                nome: "Franco",
                supporto_tecnico: true
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.header.location).toBeDefined();
            });
    });

    test("Email già esistente", () => {
        return request(app)
            .post("/api/v1/utente/web")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send({
                email: "web@test.com",
                password: "password456",
                nome: "Franco",
                supporto_tecnico: true
            })
            .expect(400, { success: false, error: 'A web user with the same email already exists.' });
    });

    test("Campo email non fornito", () => {
        return request(app)
            .post("/api/v1/utente/web")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send({
                password: "password456",
                nome: "Franco",
                supporto_tecnico: true
            })
            .expect(400, { success: false, error: "The 'email' field must be a non-empty string in email format." });
    });

    test("Campo nome non fornito", () => {
        return request(app)
            .post("/api/v1/utente/web")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send({
                email: "web@test.com",
                password: "password456",
                supporto_tecnico: true
            })
            .expect(400, { success: false, error: "The 'nome' field must be a non-empty string." });
    });

    test("Campo password non fornito", () => {
        return request(app)
            .post("/api/v1/utente/web")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send({
                email: "web@test.com",
                nome: "Franco",
                supporto_tecnico: true
            })
            .expect(400, { success: false, error: "The 'password' field must be a non-empty string." });
    });

    test("Campo supporto_tecnico fornito come stringa", () => {
        return request(app)
            .post("/api/v1/utente/web")
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send({
                email: "web@test.com",
                password: "password456",
                nome: "Franco",
                supporto_tecnico: "true"
            })
            .expect(400, { success: false, error: "The optional 'supporto_tecnico' field must be a boolean." });
    });

});

describe("GET /api/v1/utente/web/{id} : Lettura di un utente web", () => {
    test("Richiesta con successo", () => {
        return request(app)
            .get('/api/v1/utente/web/123')
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.id).toBeDefined();
                expect(res.body.email).toBeDefined();
                expect(res.body.nome).toBeDefined();
                expect(res.body.supporto_tecnico).toBeDefined();
            });
    });

    test("Segnalazione non trovata", () => {
        return request(app)
            .get("/api/v1/utente/web/123")
            .set('x-access-token', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404, { success: false, error: 'User not found with the specified ID.' });
    });
});

describe("PUT /api/v1/utente/web/{id}: Modifica dati utente web", () => {
    test("Richiesta valida", () => {
        return request(app)
            .put(`/api/v1/utente/web/123`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "newAziendaEmail@test.com",
                nome: "newNome",
                old_password: "password456",
                password: "newPassword",
                password_again: "newPassword"
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).toBe(true);
            });
    });
    test("Utente web non trovato", () => {
        return request(app)
            .put(`/api/v1/utente/web/WrongIdWrongId`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "newAziendaEmail@test.com",
                nome: "newNome",
                old_password: "password456",
                password: "newPassword",
                password_again: "newPassword"
            })
            .expect(404, { success: false, error: 'Utente web not found' });
    });
    test("Email non valida", () => {
        return request(app)
            .put(`/api/v1/utente/web/123`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "emailNonValida",
                nome: "newNome",
                old_password: "password456",
                password: "newPassword",
                password_again: "newPassword"
            })
            .expect(400, { success: false, error: "The 'email' field must be a non-empty string in email format." });
    });
    test("Nome non valido", () => {
        return request(app)
            .put(`/api/v1/utente/web/123`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "newAziendaEmail@test.com",
                nome: "",
                old_password: "password456",
                password: "newPassword",
                password_again: "newPassword"
            })
            .expect(400, { success: false, error: "The 'nome' field must be a non-empty string." });
    });

    test("Password vecchia non valida", () => {
        return request(app)
            .put(`/api/v1/utente/web/123`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "newAziendaEmail@test.com",
                nome: "newNome",
                old_password: "wrongOldPassword",
                password: "newPassword",
                password_again: "newPassword"
            })
            .expect(400, { success: false, error: 'Incorrect old password' });
    });

    test("Le due password non combaciano", () => {
        return request(app)
            .put(`/api/v1/utente/web/123`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send({
                email: "newAziendaEmail@test.com",
                nome: "newNome",
                old_password: "password456",
                password: "newPassword",
                password_again: "wrongPasswordAgain"
            })
            .expect(400, { success: false, error: 'The two passwords do not match' });
    });

});