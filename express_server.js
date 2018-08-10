const express = require("express");
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
//Setup express app
const app = express();

//"Database"
const users = [];
//store an incrementing number of IDs of each user
let nextUserId = 1;


//example
//check ID matches the ID in the database
// const fetchUser = id => {
//   for (let i = 0; i < users.length; i++){
//     const user = users[i];
//     if (user.id === id) {
//       return user;
//     }
//   }
//   return null;
// };

const fetchUserByUsername = username => {
   for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.username === username){
      return user;
    }
   }

   return null;
};

//Use cookies
const cookieParser = require('cookie-parser');


//Setup middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(cookieParser());

app.set("view engine", "ejs");


function generateRandomString() {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 6; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result;
}
console.log(generateRandomString());
//keep track of all the URLs and their shortened forms
//will show on the URLs page
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

//route sending data to urls_index.ejs
// list of urls

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies.username

    }
    res.render("urls_index", templateVars);
});


//example
//GET
// app.get("/urls", (req, res) => {
//     const user = fetchUser(parseInt(req.cookies.user_id, 10));
//     res.render("urls_index", {
//       user : user
//     })
// });

// New - GET /urls/new
// used to show the form to create a url
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});


//create a url - POST /urls
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    // console.log(req.body.longURL); // debug statement to see POST parameters
    res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});




// app.get("/u/:shortURL", (req, res) => {
//     let longURL = req.body.longURL;
//     res.redirect("urls/" + longURL);
// });


// app.get("/urls.json", (req, res) => {
//     res.json(urlDatabase);
// });

// show a specific url - GET /urls/:id
app.get("/urls/:id", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id]
    }
    res.render("urls_show", templateVars);

});

// Edit - GET /urls/:id/edit
app.get("/urls/:id/edit", (req, res) => {
    let templateVars = {
        id: id,
        url: url
    }
    const id = req.params.id;
    const url = urlDatabase[id];
    res.render("urls/shortURL", templateVars);
});


// Update - POST /urls/:id
app.post("/urls/:id/update", (req, res) => {
    let shortURL = req.params.id;
    let longURL = req.body.longURL; //equals req.params.id
    if (longURL) {
        // set this specific url to equal the contents of the form
        urlDatabase[shortURL] = longURL;
        res.render("urls_index", { urls: urlDatabase });
    } else {
        res.redirect("/urls")
    }

});


// Delete
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/index");
});

//example
//POST /Login - process Login
// app.post("/urls/login", (req,res) => {
//     const { username, password} = req.body;

//     if (username && password) {
//       const user = fetchUserByUsername(username);
//       if (user && user.password === password) {
//         res.cookie('user_id', user_id, {maxAge: 10 * 60 * 1000});
//         res.redirect(/urls);
//       } else {
//         console.log("wrong username or password");
//         res.redirect("/urls/login");
//       }
//     } else {
//       console.log("Please provide username and password");
//       res.redirect("/urls/login");
//     }
// });


//Login - POST /urls/login urls_index render the login COOKIE
app.post("/urls/login", (req, res) => {
    const uname = req.body.username;
    res.cookie('username', uname);
    res.redirect("/urls/index");

});

//Login - username render urls_index
app.get("/urls/index", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"],
    };
    res.render("urls_index", templateVars);
});

//Logout
app.post("/urls/logout", (req, res) => {
   res.clearCookie("username");
   res.redirect("/urls");
})


//example
// //GET /register
// app.get("/urls/register", (req, res) => {

//     res.render("register");
// });

// //POST /register - process registration
// app.post("/urls/register", (req, res) => {
//   let templateVars = {
//     username: req.body.username,
//     password: req.body.password,
//     password_confirm: req.body.password_confirm
//   };

//   if (username && password && password_confirm) {
//     //two passwords are the same
//     if (password === password_confirm) {
//       let user = {
//          id: nextUserId++,
//          username: username,
//          password: password
//       };

//       users.push(user);
//       req.cookie('user_id', user_id, {maxAge:10 * 60 * 1000});
//       res.redirect("/urls");

//     } else {
//       console.log("passwords does not match.");
//       res.redirect("/urls/register");
//     }
//   } else {
//     console.log("Please fill in the correct username, password and password_confirm");
//     res.redirect("/urls/register");
//   }
// });



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});