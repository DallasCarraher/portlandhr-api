const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();
const port = process.env.PORT || 3001;

app.use(morgan('short'))

app.use(cors())

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

// Get Date
function getDate() {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    today = yyyy + '/' + mm + '/' + dd;
    return today
}

// New Request Post
app.post("/newrequest", (req, res) => {
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

app.post("/updaterequest/:id", (req, res) => {
    const connection = getConnection()
    const post = req.body
    const id = req.params.id

    if (post.buttonLabel === 'Approve'){
        const status_id = 2
        const costestimate = post.reason
        console.log(post.reason)
        const updateStatement = `UPDATE RequestForm SET status_id = ${status_id}, costestimate = ${costestimate} WHERE requestform_id = ${id}`;
        connection.query(updateStatement)
        // , (err) => {
        //     if (err) {
        //         console.log(err)
        //         res.sendStatus(500)
        //     }
        // })
    }

    else if (post.buttonLabel === 'Deny'){
        const status_id = 3
        const description = post.reason
        const updateStatement = `UPDATE RequestForm SET status_id = ${status_id}, description = '${description}' WHERE requestform_id = ${id}`
        connection.query(updateStatement)
        // , (err) => {
        //     if (err) {
        //         console.log(err)
        //         res.sendStatus(500)
        //     }
        // })
    }

    else {
        res.sendStatus(500)
    }

    res.end()
})

// Delete Request
// app.delete("/removerequest/:id", (req, res) => {
//     const connection = getConnection()
//     const id = req.params.id
// })

// All Requests API Call
app.get("/requests/:id", (req, res) => {
    const connection = getConnection()

    const id = req.params.id

    if (id != '*') {
        connection.query(`SELECT * FROM RequestForm WHERE requestform_id = ${req.params.id}`, (err, rows, fields) => {
            if (err) {
                console.log(err)
                res.sendStatus(500)
            }
            console.log('here')
            res.json(rows)
        })
    }
    else if (id == '*') {
        connection.query("SELECT * FROM RequestForm", (err, rows, fields) => {
            if (err) {
                console.log(err)
                res.sendStatus(500)
            }
            res.json(rows)
        })
    }

    return
})

// Requests waiting to be Approved query
app.get("/requeststoapprove", (req, res) => {
    const connection = getConnection()

    connection.query(`SELECT * FROM RequestForm WHERE status_id = ${1}`, (err, rows, fields) => {
        if (err) {
            console.log(err)
            res.sendStatus(500)
        }
        res.json(rows)
    })

    return
})

// Requests Denied
app.get("/requestsdenied", (req, res) => {
    const connection = getConnection()

    connection.query(`SELECT * FROM RequestForm WHERE status_id = 3`, (err, rows, fields) => {
        if (err) {
            console.log(err)
            res.sendStatus(500)
        }
        res.json(rows)
    })

    return
})

// Root of API for debugging
app.get("/", (req, res) => {
    console.log("Responding to root route");
    res.send("Hello from Root");
})

// Listening Log
app.listen(port, () => {
    console.log(`Server is listening on ${port}`)
});