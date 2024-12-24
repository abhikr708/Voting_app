const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the person data

        // Create a new Person document using the Mongoose model
        const newUser = new User(data);

        // Save the new person to the database
        const response = await newUser.save();
        console.log('data saved');
        
        // Generating the token using payload (username)
        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res)=>{
    try{
        // Extract the aaddharNumber and password from the request body
        const {aadharNumber, password} = req.body;

        // Find the user by aadharNumber
        const user = await User.findOne({aadharNumber:aadharNumber});

        // If the user does not exist or the password is invalid, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:"Invalid username or password"});
        }

        // generate token
        const payload = {
            id: user.id
        };
        const token = generateToken(payload);

        // return token as response 
        res.json({token});
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Internal Server Error"});
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.userPayload.id;
        const userId = userData.id;
        // console.log("userId: ", userId);
        const user = await User.findOne({id:userId});

        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Function to change the password
router.put('/:profile/password', jwtAuthMiddleware, async (req, res)=>{
    try{
        const userId = req.userPayload.id; // Extract the id from the Token
        const {currentPassword, newPassword} = req.body; // Extract the currentPassword and the newPassword from the request body

        // Find the user by userID
        const user = await User.findById(userId);

        // If password does not match, return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: 'Password Updated'});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})




module.exports = router;