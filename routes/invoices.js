const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET / all invoices - DONE
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM invoices`);
    return res.status(200).json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

// GET / invoices / [id] - DONE
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    if (result.rows.length == 0) {
      throw new ExpressError(`Invoice ID # ${id} not found`, 404);
    } else {
      return res.status(200).json(result.rows[0]);
    }
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

// PUT / invoices / [id] - DONE
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const results = await db.query(`UPDATE invoices SET amt=$2 WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [id, amt]);

    if (results.rows.length === 0) {
      throw new ExpressError("404 not found", 404);
    } else {
      return res.status(200).json({ invoice: results.rows });
    }
  } catch (e) {
    return next(e);
  }
});
// DELETE / invoices / [id] - DONE
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`DELETE FROM invoices WHERE id=$1;`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError("404 not found", 404);
    } else {
      return res.status(200).json();
    }
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
