const sqlite3 = require("sqlite3")
const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

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
        let insert =
          "INSERT INTO employees (last_name, first_name, title, address, country_code) VALUES (?,?,?,?,?)"
        db.run(insert, ["Swanson", "Ron", "Director", "Unknown", 63])
        db.run(insert, ["Ludgate", "April", "Witcher", "Unknown", 63])
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
app.get("/employees/:id", async (res, req, next) => {
  let params = [req.params.id]
  db.get(
    `SELECT * FROM employees where employee_id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        res.status(400).json({
          error: err.message,
        })
        return
      }
      res.status(200).json(row)
    }
  )
})


// POST Employee details
app.post("/employees", async (req, res, next) => {
    var requestBody = req.body;
    db.run(`INSER INTO employees (last_name,first_name, title, address, country_code) VALUES (?,?,?,?,?)`,
        [requestBody.last_name, requestBody.first_name, requestBody.title, requestBody.address,
            requestBody.country_code
        ], (err, result) {
            if (err) {
                res.status(400).json({
                    error: err.message
                })
                return
            }
            res.status(200).json({
                "employee_id": this.lastID
            })
        }

    )
})

// PUT Employee details
app.put("/employees", (req, res, next) => {
    var requestBody = req.body
    db.run(`UPDATE employees set last_name = ?, first_name = ?, title = ?, address = ?, country_code = ? WHERE employee_id = ?`,
        [requestBody.last_name, requestBody.first_name, requestBody.title, requestBody.address,
            requestBody.country_code, requestBody.employee_id],
        (err, result) => {
            if (err) {
                res.status(400).json({
                    error:err.message
                })
                return
            }
            res.status(200).json({
                updatedID: this.changes
            })
        }
    )
})

// Delete Specific Employee
app.delete("/employees/:id", async (req, res, next) => {
    db.run(`DELETE FROM user WHERE id = ?`,
        req.params.id,
        (err, result) => {
            if (err) {
                res.status(400).json({
                error: err.message
                })
                return
            }
            res.status(200).json({
                deletedID: this.changes
            })
    })
}) 