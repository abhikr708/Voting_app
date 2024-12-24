// jwtAuthMiddleware - this middlware will be used with every route to verify the authorization
const jwt = require('jsonwebtoken');

// creating the middleware
const jwtAuthMiddleware = (req, res, next)=>{

    // First check request headers has authorization or not
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error:'Token not found'});

    // Extract the jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    // if token is not found
    if(!token) return res.status(401).json({ error:'Unauthorized' });

    try{
        // Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Send the decoded value to the server
        req.userPayload = decoded.userData;
        next();
    }catch(err){
        console.log(err);
        res.status(401).json( {error:'Invalid token'} );
    }
}

// Function to generate JWT token 
const generateToken = (userData) => {
    // Generate a new token using User data
    return jwt.sign({userData}, process.env.JWT_SECRET, {expiresIn: '1h'});
}

module.exports = {jwtAuthMiddleware, generateToken};