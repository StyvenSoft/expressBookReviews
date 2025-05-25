const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate input data
  const missingFields = !username || !password;
  if (missingFields) {
    return res.status(400).json({
      message: "Username and password are required."
    });
  }

  // Check if the user is already registered
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({
      message: "Username already exists."
    });
  }

  // Add new user
  users.push({ username, password });

  return res.status(201).json({
    message: "User registered successfully."
  });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found for the given ISBN." });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  // Iterate over all keys (book IDs)
  for (let key in books) {
    const book = books[key];
    // Case-insensitive comparison
    if (book.author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push({ id: key, ...book });
    }
  }

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ message: "No books found by the given author." });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let filteredBooks = [];

  // Convert array and filter by title
  Object.keys(books).forEach(key => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      filteredBooks.push({ isbn: key, ...books[key] });
    }
  });

  if (filteredBooks.length > 0) {
    res.status(200).json(filteredBooks);
  } else {
    res.status(404).json({ message: "No book found with the given title." });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
