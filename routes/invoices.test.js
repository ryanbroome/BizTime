// set NODE_ENV variable to 'test'
process.env.NODE_ENV === "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async function () {
  // setup a test company value in our test database
  let compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('company', 'company', 'a company worth testing') RETURNING code, name, description`);
  let result = await db.query(`INSERT INTO invoices (amt, comp_code) VALUES (100, 'company') RETURNING *`);
  //   let invoices = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test', 100) RETURNING *`);

  testCompany = compResult.rows[0];
  testInvoice = result.rows[0];
});

afterEach(async function () {
  //   delete any data created by test
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
});

afterAll(async function () {
  // close db connection
  await db.end();
});

describe("GET invoices", () => {
  test("GET a list of invoices", async function () {
    const res = await request(app).get(`/invoices`);
    expect(res.statusCode).toBe(200);
    // expect(res.body).toEqual({ invoices: testInvoice });
  });

  test("GET invoices/:id", async function () {
    const res = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
  });
  test("GET company INVALID :code", async function () {
    const res = await request(app).get(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  });
});

// describe("POST /companies", () => {
//   test("create a single company", async () => {
//     const res = await request(app).post("/companies").send({ code: "comp", name: "company", description: "a company" });
//     expect(res.statusCode).toEqual(201);
//     expect(res.body).toEqual({ code: "comp", name: "company", description: "a company" });
//   });
// });

// describe("PATCH /companies/test", () => {
//   test("update a single company", async () => {
//     const res = await request(app).patch(`/companies/${testCompany.code}`).send({ name: "company", description: "a company that does more than test it also patches" });
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toEqual({
//       companies: { code: testCompany.code, name: "company", description: "a company that does more than test it also patches" },
//     });
//   });
//   test("responds with 404 for invalid company code", async () => {
//     const res = await request(app).patch(`/companies/0`).send({ name: "company", description: "a company that does more than test it also patches" });
//     expect(res.statusCode).toEqual(404);
//   });
// });

// describe("DELETES /companies/test", () => {
//   test("Delete a single company", async () => {
//     const res = await request(app).delete(`/companies/${testCompany.code}`);
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toEqual({ status: "deleted" });
//   });
// });
