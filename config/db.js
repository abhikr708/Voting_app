const mongoose  = require('mongoose');

// Fetch the database url 
require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;

// Function to connect to the database
const dbConnect = ()=>{
    mongoose.connect(DATABASE_URL, {
        useNewUrlParser : true,
        useUnifiedTopology : true,
    })

    const db = mongoose.connection;

    db.on('connected', ()=>{
        console.log("Connected to the MongoDB database");
    });

    db.on("error", (err)=>{
        console.log("MongoDB connection error", err);

    });
    
    db.on('disconnected', ()=>{
        console.log("MongoDB server Disconnected");
    });
}

module.exports = dbConnect;