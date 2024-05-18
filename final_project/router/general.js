const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
let myPromise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(books);
    }, 1000); // Simulated delay
});


public_users.get('/',function (req, res) {
    myPromise1.then((bookslist) => {
        return res.send(JSON.stringify(bookslist, null, 4));

      })
      .catch((error) => {
        return res.status(500).send({ error: error });
    });

});

// Get book details based on ISBN
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const data = books[isbn]
        if (data) {
            resolve(data);
        } else {
            reject('Book not found');
        }
    });
}

public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn
  getBookByISBN(isbn)
        .then((book) => {
            return res.send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            return res.status(404).send({ error: error });
        });
 });
  
// Get book details based on author

function getBookByAuthor(goal) {
    return new Promise((resolve, reject) => {
        const keys = Object.values(books)
        let lst = []
  for (let x = 0, len = keys.length; x < len; x += 1) {
    let author = keys[x]["author"]
    if (goal == author) {
        let isbn = x + 1
        let title = keys[x]["title"]
        let reviews = keys[x]["reviews"]
        let dic = {
            "isbn" : isbn,
            "title": title,
            "reviews": reviews
        }
        lst.push(dic)
    }

  }
  let answer = {"booksbyauthor":lst}
        if (answer) {
            resolve(answer);
        } else {
            reject('Book not found');
        }
    });
}

public_users.get('/author/:author',function (req, res) {
  
  const goal = req.params.author
  getBookByAuthor(goal)
        .then((answer) => {
            return res.send(answer);
        })
        .catch((error) => {
            return res.status(404).send({ error: error });
        });
});

// Get all books based on title



function getBookByAuthor(goal) {
    return new Promise((resolve, reject) => {
        const keys = Object.values(books)
        let lst = []
  for (let x = 0, len = keys.length; x < len; x += 1) {
    let title = keys[x]["title"]
    if (goal == title) {
        let isbn = x + 1
        let author = keys[x]["author"]
        let reviews = keys[x]["reviews"]
        let dic = {
            "isbn" : isbn,
            "author": author,
            "reviews": reviews
        }
        lst.push(dic)
    }

  }
  let answer = {"booksbyauthor":lst}
        if (answer) {
            resolve(answer);
        } else {
            reject('Book not found');
        }
    });
}

public_users.get('/title/:title',function (req, res) {
  
    const goal = req.params.title
    getBookByAuthor(goal)
          .then((answer) => {
              return res.send(answer);
          })
          .catch((error) => {
              return res.status(404).send({ error: error });
          });
  });


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn
    const data = books[isbn]
    const review = data["reviews"]
    return res.send(review);
});

module.exports.general = public_users;
