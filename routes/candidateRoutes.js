const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const User = require('../models/user');

// Function to check the admin role
const checkAdminRole = async (userID) =>{
    try{
        const user = await User.findById(userID);
        return user.role === 'admin';
    }catch(err){
        return false;
    }
}
 
// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) =>{
    try{
        if(! await checkAdminRole(req.user.id))
            return res.status(403).json({message:'user does not has admin role'});

        const data = req.body // Assuming the request body contains the person data

        // Create a new Person document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new person to the database
        const response = await newCandidate.save();
        console.log('data saved'); 
        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Function to change the password
router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{

        if(! await checkAdminRole(req.user.id))
            return res.status(403).json({message:'user does not has admin role'});

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, //Return the updated document
            runValidators: true, // Run mongoose validation
        })

        if(!response){
            return res.status(404).json({error: 'Candidate not found'});
        }

        console.log('Data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Function to delete a candidate
router.delete('/:candidateID', jwtAuthMiddleware, async(req, res)=>{
    try{
        if(! await checkAdminRole(res.user.id))
            return res.status(403).json({message: 'user does not have admin role'});

        const candidateID = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({ error: 'Candidate not found'});
        }

        console.log('Candidate deleted successfully');
        res.status(200).json(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


module.exports = router;