import request from "supertest";
import app from "../../app.js"; // IMPORTANT: your express app export
import { registerUserService } from "../../src/services/authService.js";

let token;
let branchId;

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
        branchId = res.body.data.branch.branch_id;
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

    test("Owner can update their own profile through the users endpoint", async () => {
        const meRes = await request(app)
            .get("/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(meRes.statusCode).toBe(200);

        const res = await request(app)
            .put(`/auth/users/${meRes.body.data.user_id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Updated Owner" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Updated Owner");
    });

    test("Managers cannot promote staff or change another branch", async () => {
        const managerEmail = `manager-${Date.now()}@example.com`;
        const createManagerRes = await request(app)
            .post("/auth/createUser")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Branch Manager",
                email: managerEmail,
                password: "Password123!",
                role: "manager",
                branchId: branchId
            });

        expect(createManagerRes.statusCode).toBe(201);

        const managerLogin = await request(app)
            .post("/auth/login")
            .send({ email: managerEmail, password: "Password123!" });

        expect(managerLogin.statusCode).toBe(200);

        const managerToken = managerLogin.body.data.token;

        const res = await request(app)
            .post("/auth/createUser")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                name: "Other Branch Cashier",
                email: `cashier-${Date.now()}@example.com`,
                password: "Password123!",
                role: "manager",
                branchId: "00000000-0000-0000-0000-000000000000"
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.error).toContain("Forbidden");
    });

    test("Access protected route", async () => {

        const res = await request(app)
            .get("/products")
            .set("Authorization", `Bearer ${token}`);

        expect([200, 404]).toContain(res.statusCode);
    });

});