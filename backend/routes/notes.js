const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// Route 1 Get All the Notes using  GET "/api/auth/getuser" . No Login required
router.get('/fetchallnotes', fetchuser, async (req, res)=>{
    try {
        const notes = await Note.find({user: req.user.id})
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 2 Add a new Note using  Post "/api/auth/addnote" . Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 letters').isLength({ min: 5 }),
],async (req, res)=>{
    try {
        const {title, description, tag } = req.body;
        // If there are Errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
    
        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 3 Update a new Note using  Put "/api/notes/updatenote" . Login required
router.put('/updatenote/:id', fetchuser, async (req, res)=>{
    try {
        const {title, description, tag} = req.body;
        // Create a new Note object
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};
    
        // Find the Note to be update it  and update it
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}
    
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }
        
        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json({note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 4 Delete a new Note using  Delete "/api/notes/deletenote" . Login required
router.delete('/deletenote/:id', fetchuser, async (req, res)=>{
    try {
        const {title, description, tag} = req.body;
        
        // Find the Note to be delete it  and delete it
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}
        // Allow Deletion only if uusers owns this note
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }
    
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Success": "Npte has been Deleted", note: note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})



module.exports = router;