const { render } = require("ejs")
const express = require("express")
const author = require("../models/author")
const router = express.Router()

// All Authors Route
router.get("/",async(req,res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ""){
        searchOptions.name = new RegExp(req.query.name, "i")
    }

    //if(req.query == null)
      //  searchOptions = {}

    try{
        const authors = await author.find(searchOptions)
        res.render("authors/index",{
            authors:authors, 
            searchOptions:req.query 
        })
    }catch(err){
        res.redirect("/")
    }
    //res.render("authors/index")
})


// New Author Route
router.get("/new",(req,res) => {
    res.render("authors/new",{author: new author()})
})


// Create Author Route
router.post("/",async (req,res) =>{
    const a = new author({
        name:req.body.name
    })
    try{
        const newAuthor = await a.save()
        //res.redirect(`authors/${newAuthor.id}`)
        res.redirect("authors")
    }catch(err){
        res.render("authors/new",{
            author:author,
            errorMessage: "Error creating Author"
        })
    }


})

module.exports = router