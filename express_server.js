const express = require("express");
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
//Setup express app
const app = express();
const bcrypt = require("bcrypt");
const cookieSession = require('cookie-session');

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: bcrypt.hashSync("1", 10)
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcrypt.hashSync("dishwasher-funk", 10)
    }
};

const urlDatabase = {
    "b2xVn2": {
        userUrl: "http://www.lighthouselabs.ca",
        userID: "userRandomID"
    },
    "9sm5xK": {
        userUrl: "http://www.google.com",
        userID: "user2RandomID"
    }
};


//Setup middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(cookieSession({
    name: 'session',
    signed: false,

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

// get random user ID
function generateRandomString() {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 6; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result;
}

//Registration - check whether email has already existed.
function checkEmailExists(userEmail) {
    for (let key in users) {
        if (userEmail === users[key].email) {
            return true;
        }
    }

    return false;
}


function findUserByEmail(userEmail) {
    for (let user in users) {
        if (users[user].email === userEmail) {
            return users[user];
        }
    }
    return null;
}


function urlsForUser(user_id) {
    let result = {};
    for (let shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userID === user_id) {
            result[shortURL] = urlDatabase[shortURL].userUrl;
        }
    }

    return result;
}

//route sending data to urls_index.ejs
// list of urls/ index page
app.get("/urls", (req, res) => {
    let user = users[req.session.user_id];
    var urls = urlsForUser(req.session.user_id);

    if (!req.session.user_id) {
        let templateVars = {
            urls: urls,
            user: user,
            urlDatabase: urlDatabase
        };
        res.render("urls_index", templateVars);
    } else {
        let templateVars = {
            urls: urls,
            user: user,
            urlDatabase: {}
        };
        res.render("urls_index", templateVars);
    }

});

// New - GET /urls/new
// used to show the form to create a url
app.get("/urls/new", (req, res) => {
    if (users[req.session.user_id]) {
        res.render("urls_new", {
            user: users[req.session.user_id]
        });
    } else {
        res.redirect("/urls/login");
    }


});


//create a url - POST /urls
app.post("/urls/new", (req, res) => {


    if (req.session.user_id) {
        let newShortURL = generateRandomString();
        let newLongURL = req.body.longURL;
        let userId = req.session.user_id;
        let newUrl = {
            userUrl: newLongURL,
            userID: userId
        };

        urlDatabase[newShortURL] = newUrl;
        let templateVars = {
            user: users[userId],
            urls: urlsForUser(userId)

        }
        res.render("urls_index", templateVars);
    } else {
        res.redirect("/urls/login");
    }
});



//Login - GET username render urls_login
app.get("/urls/login", (req, res) => {
    res.render("urls_login");
});

//Login - POST /urls/login urls_index render the login COOKIE
app.post("/urls/login", (req, res) => {
    let userEmail = req.body.email;
    let userPassword = req.body.password;

    if (userEmail === "" || userPassword === "") {
        res.status(403).send("Please enter an email to log in. Try to <a href='/urls/login'>log in</a> again.");
    } else {
        let user = findUserByEmail(userEmail);
        if (user && bcrypt.compareSync(userPassword, user.password)) {
            req.session.user_id = user.id;

            res.redirect("/urls");
        } else {
            res.status(403).send("Email or Password is wrong. Try to <a href='/urls/login'>log in</a> again.");
        }
    }
});


//Logout
app.post("/urls/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});


// //GET /register
app.get("/urls/register", (req, res) => {
    res.render("urls_register");
});

// POST /register
app.post("/urls/register", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let id = generateRandomString();
    if (email === "" || password === "") {
        res.status(400).send("Please fill in email and password. Try to <a href='/urls/register'>Register</a> again.");
    } else if (checkEmailExists(email)) {
        res.status(400).send("This email has been registered. Try to <a href='/urls/login'>Log in</a>.");
    } else {
        let newId = generateRandomString();
        users[newId] = {
            id: newId,
            email: email,
            password: bcrypt.hashSync(password, 10)
        };

        req.session.user_id = id;
        res.redirect("/urls");
    };

});


// Delete
app.post("/urls/:id/delete", (req, res) => {
    if (req.session.user_id === urlDatabase[req.params.id].userID) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
    } else {
        res.redirect("/urls/login");
    }

});


// show a specific url - GET /urls/:id
app.get("/urls/:id", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        user: users[req.session.user_id]
    }
    res.render("urls_show", templateVars);

});


// Edit - GET /urls/:id/edit
app.get("/urls/:id/edit", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id].userUrl,
        user: users[req.session.user_id]
    }
    res.render("urls_show", templateVars);
});


// Update - POST /urls/:id
app.post("/urls/:id/update", (req, res) => {
    let updateShortURL = req.params.id;
    let updateLongURL = req.body.longURL;
    let user_id = req.session.user_id;
    if (user_id) {
        urlDatabase[updateShortURL].userUrl = updateLongURL;

        let templateVars = {
            user: users[user_id],
            urls: urlsForUser(user_id)

        }

        res.render("urls_index", templateVars);
    } else {
        res.redirect("/urls/login");
    }

});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});