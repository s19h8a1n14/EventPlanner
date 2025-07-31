import express from "express";
import bodyParser from "body-parser";
import postgres from 'postgres';
import Stripe from 'stripe';
import pg from "pg";
import multer from 'multer';
import XLSX from 'xlsx';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const upload = multer();

const  app = express();

const  port = 3000;

var isLogged = false;

let u_id=0;

// Stripe configuration using environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// PostgreSQL client setup
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to database with error handling
db.connect()
  .then(() => {
    console.log("Connected to PostgreSQL database successfully");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    console.log("Application will continue without database connection");
    console.log("Please install and start PostgreSQL to enable full functionality");
  }); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("login.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/home", async(req, res)=>{
    if(isLogged){
        var p='public';
        const result = await db.query("SELECT * FROM eventsinfo WHERE private_public = $1 order by event_id asc", [p]);    
        var arr = result.rows;
        res.render("home.ejs", {event: arr});
    }
    else{
        res.render("logintoview.ejs");
    }
    
});

app.get("/organise", (req, res)=>{
    if(isLogged){
        res.render("organise.ejs");
    }
    else{
        res.render("logintoview.ejs")
    }
});

app.get("/myevents", async(req, res)=>{
    var pu='public';
    var p='private';
    const result = await db.query("select * from eventsinfo where private_public = $1 and user_id = $2;", [pu, u_id]);
    const result1 = await db.query("select * from eventsinfo where private_public = $1 and user_id = $2;",[p, u_id]);
    res.render("myevents.ejs",{pub: result.rows, pri: result1.rows});
});

app.get("/public", (req, res)=>{
    res.render("public.ejs");
});

app.get("/private", (req, res)=>{
    res.render("private.ejs");
});

app.get("/mybookings", async(req, res)=>{
    if(isLogged){
        var result = await db.query("select * from bookingsinfo where user_id = $1 order by booking_id desc", [u_id]);
    let arr=[];
    for(var i=0;i<result.rows.length;i++){
        var e_id = result.rows[i].event_id;
        var result2 = await db.query("select * from eventsinfo where event_id = $1", [e_id]);
        arr.push(result2.rows[0]);
    }
    res.render("mybookings.ejs", {arr:arr});
    }
    else{
        res.render('logintoview.ejs')
    }
    
});

app.post("/login", async(req, res)=>{
    var email=req.body.your_email;
    var password = req.body.your_pass;
    try {
        var result = await db.query("select * from userinfo where email_id=$1", [email]);
        var actual_pass = result.rows[0].user_password;
        var id = result.rows[0].user_id;
        if(actual_pass===password){
            isLogged=true;
            u_id = id;
            res.redirect("/home");
        }
        else{
            res.render("login_wrongpass.ejs");
        }
    } catch (error) {
        res.render("login_nouser.ejs");
    }
});

app.post("/register", async(req, res)=>{
    var email = req.body.email;
    var username = req.body.name;
    var password = req.body.pass;
    var result1=await db.query("select * from userinfo where email_id=$1", [email]);
    if(result1.rowCount>0){
        res.render("registerlogin.ejs");
    }
    else{
        var result = await db.query("insert into userinfo (email_id, user_name, user_password) values ($1, $2, $3)", [email, username, password]);
        isLogged=true;
        var result1 = await db.query("select user_id from userinfo where email_id = $1", [email]);
        u_id=result1.rows[0].user_id;
        res.redirect("/home");
    }
});

app.post("/readMore", async (req, res)=>{
    if(isLogged){
        var id = req.body.id;
        const result = await db.query("update eventsinfo set no_of_views=no_of_views+1 where event_id = $1 ", [id]);
        const result1 = await db.query("select * from eventsinfo where event_id = $1", [id]);
        var readMoreArr = result1.rows[0];
        res.render("readmore.ejs", {event: readMoreArr});
    }
    else{
        res.render("logintoview.ejs");
    }
});

app.post("/bookTickets",async(req, res)=>{
    var event_id = req.body.id;
    var result1 = await db.query("select * from eventsinfo where event_id = $1", [event_id]);
    var result2 = await db.query("select * from userinfo where user_id = $1", [u_id]);
    res.render('paymentshome.ejs', {
        key: PUBLISHABLE_KEY, event: result1.rows[0], user_name: result2.rows[0].user_name
    });
});

app.post('/payment', async(req, res) => {
    console.log(req.body);
    var event_id = req.body.event;
    var result = await db.query("select * from eventsinfo where event_id = $1", [event_id]);
    var result2 = await db.query("select * from userinfo where user_id = $1", [u_id]);
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: result2.rows[0].user_name,
        address: {
            line1: '123 Main St',
            postal_code: '534629',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India'
        }
    })
    .then(customer => {
        return stripe.charges.create({
            amount: result.rows[0].fee*100, // Amount in cents
            description: result.rows[0].event_name,
            currency: 'USD',
            customer: customer.id
        });
    })
    .then(charge => {
        var result1 = db.query("insert into bookingsinfo (user_id, event_id) values ($1, $2)", [u_id, event_id]); 
        var result2 = db.query("update eventsinfo set no_of_bookings = no_of_bookings + 1 where event_id = $1", [event_id]);
        res.redirect('/mybookings');
    })
    .catch(err => {
        res.status(500).send('Error: ' + err.message);
    });
});


app.post('/publicsubmit',async(req, res)=>{
    var data=req.body;
    var p='public';
    var result = await db.query("insert into eventsinfo (user_id, host_image, date_and_time, event_name, event_description, location, fee, event_type, no_of_bookings, no_of_views, private_public, event_poster) values ($1, $2,$3, $4, $5, $6, $7, $8, 0, 0, $9, $10);", [u_id, data.event_host, data.event_date_and_time, data.event_name, data.event_description, data.event_locations, data.event_fee, data.event_type, p, data.event_poster]);
    res.redirect('/home');
});

app.post('/privatesubmit', upload.single('guest_list'), async (req, res) => {
    try {
        var data = req.body;
        var p='private';
        var result =await db.query("insert into eventsinfo (user_id, date_and_time, event_name, event_description, location, event_type, private_public, event_poster) values ($1, $2, $3, $4, $5, $6, $7, $8) returning event_id;",[u_id, data.date_and_time, data.event_type, data.event_type, data.venue, data.event_type, p, data.event_poster]);
        var event_id = result.rows[0].event_id;
        // Read the file buffer
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        
        // Get the first sheet's data
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data1 = XLSX.utils.sheet_to_json(sheet);
        for(var i=0;i<data1.length;i++){
            var result2 = await db.query("insert into guestlistinfo (user_id, event_id,guest_email, guest_name) values ($1, $2, $3, $4);", [u_id, event_id, data1[i].EmailId, data1[i].Name]);
        }
        // Respond with processed data or a success message
        res.redirect("/myevents");
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});

app.post('/updateeventdetails', async(req, res)=>{
    var data=req.body;
    var result = await db.query("update eventsinfo set location = $1, date_and_time = $2, fee = $3 where event_id = $4", [data.location, data.date_and_time, data.fee, data.event_id]);
    res.redirect('/myevents');
});

app.post('/privateevents',async(req, res)=>{
    var data=req.body;
    console.log(data);
    var result = await db.query("select * from eventsinfo where event_id = $1", [data.event_id]);
    console.log(result);
    res.render('privateevents.ejs', {event: result.rows[0]});
});

app.post('/guestlist', async(req, res)=>{
    var data=req.body;
    var result1 = await db.query("select * from guestlistinfo where event_id = $1", [data.id]);
    console.log(result1);
    console.log(data);
    res.render('guestlist.ejs', {guest: result1.rows});
});

app.post('/addnewguest', async(req, res)=>{
    var data=req.body;
    console.log(data);
    console.log(data.guest_name);
    var result = await db.query("insert into guestlistinfo (user_id, event_id, guest_email, guest_name) values ($1, $2, $3, $4);", [u_id, data.event_id,data.guest_email, data.guest_name]);
    var result1 = await db.query("select * from guestlistinfo where event_id = $1", [data.event_id]);
    res.render('guestlist.ejs', {guest: result1.rows});
})

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});
