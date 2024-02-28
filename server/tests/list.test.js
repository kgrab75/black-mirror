const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../app");


const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, `../.env.${process.env.NODE_ENV}`);
const dotenv = require('dotenv');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
} else {
    dotenv.config();
}

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe("GET /api/lists", () => {
    it("should get all the lists", async () => {
        const token = await request(app).post("/api/auth/login").send({
            email: process.env.EMAIL,
            password: process.env.PASSWORD,
        });

        const response = await request(app)
            .get("/api/lists")
            .set({
                Authorization: "bearer " + token.body.token,
                "Content-Type": "application/json",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });
});

describe("POST /api/list", () => {
    it("should add an list to the database", async () => {
        const token = await request(app).post("/api/auth/login").send({
            email: process.env.EMAIL,
            password: process.env.PASSWORD,
        });

        const response = await request(app)
            .post("/api/list")
            .send({
                name: "Jogging",
                email: process.env.EMAIL,
            })
            .set({
                Authorization: "bearer " + token.body.token,
                "Content-Type": "application/json",
            });

        expect(response.statusCode).toBe(201);
    });
});