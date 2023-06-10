require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const app = express();
const cors = require('cors');
app.use(cors());

// Connect to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Parse JSON payloads
app.use(express.json());
const nodemailer = require('nodemailer');
//set up nodemailer
let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
app.post('/register',(req,resp)=>{
    const{name,email}=req.body;
    const user = {name,email};
    const query = 'INSERT INTO users SET ?';

    //insert the user into db

    db.query(query,user,(err,result)=>{
        if(err){
            console.log(err);
            if(err.code == 'ER_DUP_ENTRY'){
                resp.status(400).send('Email already exists in our records');
            }else{
            resp.status(500).send('server error');
            }
        }else{
            let mailOptions = {
                from : process.env.EMAIL_USER,
                to: email,
                subject: "registration completed successfully!",
                text: `Hello ${name},\n\n Thank you for registering with us! your mail id with us is ${email}.`
            };
            transporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    console.log(err);
                    resp.status(500).send('server error');
                }
                else {
                    resp.status(200).send({message:'Registration successfull'});
                }
            });
        }
    });
});
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
