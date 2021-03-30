const sqlite3 = require("sqlite3").verbose()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const PORT = 8000

const db = new sqlite3.Database("./emp_database.db", (err) => {
  if (err) {
    console.log(`Error in opening the DB: "${err.name}: ${err.message}"`)
  } else {
    db.run(
      "CREATE TABLE employees( \
        employee_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
        last_name NVARCHAR(30) NOT NULL, \
        first_name NVARCHAR(30) NOT NULL, \
        title NVARCHAR(30), \
        address NVARCHAR(100), \
        country_code INTEGER\
        )",
      (err) => {
        if (err) {
          console.log("Table already Exists.")
        }
      }
    )
  }
})

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`)
})

/** ROUTES **/

// GET All Employees
app.get("/employees", async (req, res, next) => {
  db.all("SELECT * FROM employees", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message })
      return
    }
    res.status(200).json(rows)
  })
})

// GET Specific Employee
app.get("/employees/:id", async (req, res, next) => {
  let params = [req.params.id]
  db.get(
    `SELECT * FROM employees where employee_id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message })
        return
      }
      res.status(200).json(row)
    }
  )
})

// POST Employee details
app.post("/employees", (req, res, next) => {
  let data = {
    last_name: req.body.last_name,
    first_name: req.body.first_name,
    address: req.body.address,
    country_code: req.body.country_code,
    title: req.body.title,
  }
  const params = [
    data.last_name,
    data.first_name,
    data.title,
    data.address,
    data.country_code,
  ]
  db.run(
    "INSERT INTO employees (last_name, first_name, title, address, country_code) VALUES (?,?,?,?,?)",
    params,
    function (err, result) {
      if (err) {
        res.status(400).json({ error: err.message })
        return
      }
      res.status(201).json({
        employee_id: this.lastID,
      })
    }
  )
})

// PUT Employee details
app.patch("/employees/:id", (req, res, next) => {
  let data = {
    last_name: req.body.last_name,
    first_name: req.body.first_name,
    title: req.body.title,
    address: req.body.address,
    country_code: req.body.country_code,
  }

  db.run(
    `UPDATE employees set
           last_name = COALESCE(?,last_name), 
           first_name = COALESCE(?,first_name), 
           title = COALESCE(?,title),
           address = COALESCE(?,address),
           country_code = COALESCE(?,country_code)
           WHERE employee_id = ?`,
    [
      data.last_name,
      data.first_name,
      data.title,
      data.address,
      data.country_code,
      data.employee_id,
    ],
    (err, result) => {
      if (err) {
        res.status(400).json({
          error: err.message,
        })
        return
      }
      res.status(200).json({
        message: "ok",
        data: data,
      })
    }
  )
})

// Delete Specific Employee
app.delete("/employees/:id", async (req, res, next) => {
  db.run(
    `DELETE FROM employees WHERE employee_id = ?`,
    req.params.id,
    (err, result) => {
      if (err) {
        res.status(400).json({
          error: err.message,
        })
        return
      }
      res.status(200).json({
        message: "ok",
      })
    }
  )
})
