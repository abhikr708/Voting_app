const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const dbConnect = require('./config/db');

// Load the config from env
require('dotenv').config();
const PORT = process.env.PORT || 4000;

// Middleware Function
const logRequest = (req, res, next)=>{
    console.log(`${new Date().toLocaleString()}, Request Made to: ${req.originalUrl}`);
    next(); // move to the next phase
}
app.use(logRequest);

// Establish connection to the database
dbConnect();

// const {jwtAuthMiddleware} = require('./jwt');

// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use the router
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, ()=>{
    console.log(`Server started at PORT ${PORT}`)
});