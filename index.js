const express = require('express');
const Joi = require('joi').extend(require('@joi/date'));
const db = require('./database');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// JOI adalah lib validator dari JS 
// Documentasi lengkap 
// https://joi.dev/api/?v=17.6.0

// tambahan , untuk Date format 
// npm install @joi/date 


// func custom untuk validasi , parameternya nerima value dari JOI nya
const checkUniqueUsername = async (username) => { 
    const user = await db.query('select * from users where username = ?', [username]);
    if (user.length !== 0) {
        throw new Error("username is not unique");
    }
}


app.post("/", async (req, res) => {
    // console.log(req.body);

    // Buat object Joi 
    // attributnya adalah nama key dari form yang dikirim , biar lebih mudah saja 
    const schema = 
        Joi.object({
            username: Joi.string().external(checkUniqueUsername), // untuk menggunakan funct custom 
            email: Joi.string().email({ minDomainSegments:2 }).required(), 
            phone_number: Joi.string().min(10).max(15).pattern(/^[0-9]+$/),
            height: Joi.number().min(100).max(200),
            birth_date : Joi.date().format('DD/MM/YYYY'),
             // untuk date.format perlu tambahan install @joi/date
            firstname: Joi.string().min(5).max(10).required().error(errors => {
                errors.forEach(err => {
                console.log(err.code)
                switch (err.code) {
                    case "any.required":
                        err.message = "Value should not be empty!";
                        break;
                    case "string.min":
                        err.message = `Value should have at least  5 characters!`;
                        break;
                    case "string.max":
                        err.message = `Value should have at most 10 characters!`;
                        break;
                    default:
                        break;
                }
                });
                return errors;
            }),
        })

        // NB : hati-hati untuk penggunaan min() max() , kalau di depannya ada string() , dianggap length nya , kalau ada number() dianggap valuenya 

    try {
        await schema.validateAsync(req.body);
    } catch (error) {
        return res.status(403).send(error.toString());
    }

    try {
        const users = await db.query("select count(*)+1 as count from users");
        let user = {
            id: "U" + (users[0].count+"").padStart(3, "0"),
            ...req.body
        }
        await db.query("insert into users set ?", user)
        return res.status(201).send(user);
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.listen(3000, () => { console.log("server running on port 3000") });