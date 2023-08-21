const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET / all invoices
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM invoices`);
    return res.status(200).json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

// GET / invoices / [id] - DONE
// TODO add error handler if no ID requested that does not exist
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    return res.status(200).json(result.rows[0]);
  } catch (e) {
    return next(e);
  }
});

// POST / invoices - DONE
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) 
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

// TODO stopping point pickup on patch invoice by id
// PUT / invoices / [id]
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paid } = req.body;
    const results = db.query(`UPDATE invoices SET() VALUES() WHERE id=$1`, [id]);
    return res.status(200).json();
  } catch (e) {
    return next(e);
  }
});
// DELETE / invoices / [id]

// TODO update companies route - GET /companies/[code] if the company given cannot be found, this should return a 404 status response

module.exports = router;
