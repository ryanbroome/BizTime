const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET / all invoices - DONE
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT id, comp_code FROM invoices ORDER BY id`);
    return res.status(200).json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

// GET / invoices / [id] - DONE
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT i.id,
      i.comp_code,
      i.amt,
      i.paid,
      i.add_date,
      i.paid_date,
      c.name,
      c.description
      FROM invoices AS i
      INNER JOIN companies AS c 
      ON (i.comp_code = c.code)
      WHERE id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("No such invoice", 404);
    }
    const data = result.rows[0];
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };
    return res.json({ invoice: invoice });
  } catch (e) {
    return next(e);
  }
});

// POST / invoices - DONE
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) 
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json(result.rows[0]);
  } catch (e) {
    return next(e);
  }
});

// PUT / invoices / [id] - DONE, updated w/solution
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    let paidDate = null;

    const currResult = await db.query(
      `SELECT paid
      FROM invoices
      WHERE id = $1`,
      [id]
    );

    if (currResult.rows.length === 0) {
      throw new ExpressError(`No such invoice ${id}`, 404);
    }

    const currPaidDate = currResult.rows[0].paid_date;

    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidDate;
    }

    const result = await db.query(
      `UPDATE invoices 
      SET amt=$1, paid=$2, paid_date=$3 
      WHERE id=$4
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    return res.status(200).json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// DELETE / invoices / [id] - DONE
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const results = await db.query(
      `DELETE FROM invoices 
      WHERE id=$1
      RETURNING id`,
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }
    return res.status(200).json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

// TODO Discussion: Had some trouble with the further study,specifically the invoices PUT route. Had a hard time thinking of the logic to update paid_date, made sense as reading it to make a query to db, look at the data you get back, apply the logic to it then update the database with the result you want based on the logic.
// ?START  First attempt GET invoices/:id
//  router.get("/:id", async (req, res, next) => {
//   try {
//     const result = await db.query(`SELECT * FROM invoices WHERE id=$1`, [req.params.id]);
//     if (result.rows.length == 0) {
//       throw new ExpressError(`Invoice ID # ${req.params.id} not found`, 404);
//     } else {
//       return res.status(200).json(result.rows[0]);
//     }
//   } catch (e) {
//     return next(e);
//   }
// });
