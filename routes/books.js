const { render } = require("ejs")
const express = require("express")
const author = require("../models/author")
const book = require("../models/book")
const path = require("path")
const fs = require("fs")
const uploadPath = path.join("public", book.coverImageBasePath)
const imageMimeTypes = ["image/jpeg","image/png","image/gif"]
const multer = require("multer")
const router = express.Router()
const upload = multer({
    dest: uploadPath,
    fileFilter: (req,file, callback) =>{
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
})

// All Books Route
router.get("/",async(req,res) => {
    let query = book.find()
    if(req.query.title != null && req.query.title != ""){
        query = query.regex("title", new RegExp(req.query.title, "i"))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ""){
        query = query.lte("publisDate", req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ""){
        query = query.gte("publisDate", req.query.publishedAfter)
    }
    try{
        const books = await query.exec()
        res.render("books/index",{
            books: books,
            searchOptions: req.query
        })
    }catch(err){
        res.redirect("/")
    }
    
})


// New book Route
router.get("/new", async (req,res) => {
    renderNewPage(res, new book());
})


// Create Book Route
router.post("/",upload.single("cover"),async (req,res) =>{
    const fileName = req.file != null ? req.file.filename: null

    const b = new book({
        title:req.body.title,
        author: req.body.author,
        publisDate: new Date(req.body.publisDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    });

    try{
        const newBook = await b.save();
        //res.redirect(`books/${newBook.id}`)
        res.redirect("books")
    }catch(err){
        if(b.coverImageName != null){
            removeBookCover(b.coverImageName)
        }
        renderNewPage(res, b,true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err)
            console.error(err)
    })
}

async function renderNewPage(res,b,hasError = false){
    try{
        const authors = await author.find({});
        const params = {
            authors: authors,
            book:b
        }
        if(hasError) params.errorMessage = "Error Creating Book" 
        res.render("books/new",params)
    }catch(err){
        res.redirect("/books");
    }
}

module.exports = router