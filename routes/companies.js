const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

// GET all companies - DONE
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies ORDER BY name`);
    return res.status(200).json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

// GET company by code - DONE
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      `
    SELECT * 
    FROM companies
    WHERE code=$1`,
      [code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError("404 not found, no code found", 404);
    }
    const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code=$1 ORDER BY id`, [code]);

    results.rows[0]["invoices"] = invoices.rows;

    return res.status(200).json({ companies: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// GET company by code SOLUTION
router.get("/solution/:code", async (req, res, next) => {
  try {
    let { code } = req.params;

    const compResult = await db.query(
      `SELECT code, name, description
           FROM companies
           WHERE code = $1`,
      [code]
    );

    const invResult = await db.query(
      `SELECT id
           FROM invoices
           WHERE comp_code = $1`,
      [code]
    );

    if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    const company = compResult.rows[0];
    const invoices = invResult.rows;

    company.invoices = invoices.map((inv) => inv.id);

    return res.json({ company: company });
  } catch (e) {
    return next(e);
  }
});

// POST create a company & returning info - DONE
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, {
      replacement: "-",
      remove: /[*+~.()'"!:@]/g,
      lower: true,
    });
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
    return res.status(201).json(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

// PUT / PATCH / companies / [code] - DONE
router.patch("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update a company with code of ${code}`, 404);
    }
    return res.send({ companies: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// DELETE companies / [code] - DONE
router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    if (!code) {
      throw new ExpressError(`Not found`, 404);
    } else {
      const results = db.query(`DELETE FROM companies WHERE code =$1`, [code]);
      return res.send({ status: "deleted" });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
