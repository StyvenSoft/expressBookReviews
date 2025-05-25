const express = require('express');
const axios = require('axios');
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

  if (!isValid(username)) {
        return res.status(400).json({ message: "This username is invalid" });
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
public_users.get("/", async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/booksdb'); // Route simulates local access
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Route simulates local access
public_users.get("/booksdb", (req, res) => {
  res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get("http://localhost:5000/booksdb");
    const books = response.data;

    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book data", error: err.message });
  }
});
  
// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  try {
    const books = await axios.get("http://localhost:5000/booksdb");
    const author = req.params.author.toLowerCase();

    // Filter books by author
    const filteredBooks = Object.values(books).filter((book) =>
      book.author.toLowerCase() === author
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.status(200).json(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: "Error getting books", error: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  try {
    const books = await axios.get("http://localhost:5000/booksdb");
    const title = req.params.title.toLowerCase();

    // Filter books by title
    const filteredBooks = Object.values(books).filter((book) =>
      book.title.toLowerCase() === title
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "Title not found" });
    }

    res.status(200).json(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: "Error getting books", error: error.message });
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
