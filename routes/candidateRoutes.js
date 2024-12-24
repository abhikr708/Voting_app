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
        if(! await checkAdminRole(req.userPayload.id))
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

// Function to change the Cadidate details
router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{

        if(! await checkAdminRole(req.userPayload.id))
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
        if(! await checkAdminRole(req.userPayload.id))
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

// Lets start voting
// Function to get the list of all the candidates with only name and party fields
router.get('/', async (req, res)=>{
    try{
        const candidates = await Candidate.find({}, 'name party _id');

        // Return the list of candidates
        res.status(200).json(candidates);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"});
    }
})

// Function to vote a candidate
router.post('/vote/:candidateID', jwtAuthMiddleware, async(req, res)=>{
    // no admin can vote
    // user can only vote once

    candidateID = req.params.candidateID;
    userID = req.userPayload.id;

    try{
        // Find the candidate
        const candidate = await Candidate.findById(candidateID);
        if(!candidate)
            return res.status(404).json({ message:'Candidate not found' });

        const user = await User.findById(userID);
        if(!user)
            return res.status(404).json({ message:'user not found'});

        // if user is admin
        if(user.role === 'admin')
            return res.status(404).json({ message:'Admin is not allowed to vote'});
        
        // if user has already voted
        if(user.isVoted)
            return res.status(404).json({ message:'you have already voted'});

        // update the candidate document to update the vote
        candidate.votes.push({user: userID});
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true;
        await user.save();

        return res.status(200).json({message: 'Vote recorded successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});

// Function to see the vote count of all candidates
router.get('/vote/count', async(req, res)=>{
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({ voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidates.map((data)=>{
            return{
                party: data.party,
                count: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
    }
    catch{
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

module.exports = router;