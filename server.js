const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();
const port = process.env.PORT || 3001;

app.use(morgan('short'))

//app.use(cors())

app.use(bodyParser.urlencoded({ extended:false }))
app.use(bodyParser.json())

// Get MySql Connection
function getConnection() {
    return mysql.createConnection({
        host: 'portlandhr.crguzqvjihyb.us-west-2.rds.amazonaws.com',
        user: 'bladerunner',
        password: 'Shockjockey01',
        database: 'requestDB'
    })
}

function getDate() {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    today = yyyy + '/' + mm + '/' + dd;
    return today
}

app.post("/newuser", (req, res) => {
    const connection = getConnection()
    const insertStatement = "INSERT INTO RequestForm(employee_id, status_id, type_id, submissiondate, deadlinedate, costestimate, description)"
    const post = req.body
    const today = getDate()

    if (post.requesttype == 'Travel'){
        post.requesttype = 1;
    } else if (post.requesttype == 'Non-Travel') {
        post.requesttype = 2;
    } else {
        post.requesttype = 3;
    }

    console.log(post.requesttype)
    console.log(today)

    connection.query(`${insertStatement} VALUES('${post.id}', '1', '${post.requesttype}', '${today}', '${post.deadlinedate}', 'NULL', '${post.description}')`)

    res.end()
})

// Root of API for debugging
app.get("/", (req, res) => {
    console.log("Responding to root route");
    res.send("Hello from Root");
})

// Parse users to JSON and print to DOM
app.get("/users/:id", (req, res) => {
    const connection = getConnection()

    const id = req.params.id

    if (id != '*') {
        connection.query(`SELECT * FROM users WHERE id = ${req.params.id}`, (err, rows, fields) => {
            if (err) {
                console.log(err)
                res.sendStatus(500)
            }
            console.log('here')
            res.json(rows)
        })
    }
    else if (id == '*') {
        connection.query("SELECT * FROM users", (err, rows, fields) => {
            if (err) {
                console.log(err)
                res.sendStatus(500)
            }
            console.log('no here')
            res.json(rows)
        })
    }

    return
})




app.listen(port, () => {
    console.log(`Server is listening on ${port}`)
});