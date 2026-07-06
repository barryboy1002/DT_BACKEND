import request from "supertest";
import app from "../../app.js"; // IMPORTANT: your express app export

let token;

describe("Auth Flow", () => {

    const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}@example.com`;
    const userData = {
        businessName: "Test Business",
        phone: "0700000000",
        name: "Test Owner",
        email: uniqueEmail,
        password: "Password123!",
        plan: "free"
    };

    test("Register business + owner", async () => {

        const res = await request(app)
            .post("/auth/register")
            .send(userData);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe(userData.email);
    });

    test("Login user", async () => {

        const res = await request(app)
            .post("/auth/login")
            .send({
                email: userData.email,
                password: userData.password
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.token).toBeDefined();

        token = res.body.data.token;
    });

    test("Access protected route", async () => {

        const res = await request(app)
            .get("/products")
            .set("Authorization", `Bearer ${token}`);

        expect([200, 404]).toContain(res.statusCode);
    });

});