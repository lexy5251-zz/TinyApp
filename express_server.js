const express = require("express");
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
const app = express();
const uuid = require("uuid");

function generateRandomString(){
  var result = '';
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random()*chars.length)]
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

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

//route sending data to urls_index.ejs
// list of urls
app.get("/urls", (req, res) => {
  res.render("urls_index", { urls: urlDatabase });
});

// New - GET /urls/new
// used to show the form to create a url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(req.body.longURL);  // debug statement to see POST parameters
  res.redirect("urls/" + shortURL);        // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  res.redirect("urls/"+longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// show a specific url - GET /urls/:id
app.get("/urls/:id", (req, res) => {
  res.render("urls_show", {
    urls: urlDatabase,
    shortURL: req.params.id,
    longURL:urlDatabase[req.params.id] });

});

//
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


// Edit - GET /urls/:id/edit
app.get("/urls/:id/edit", (req, res) => {
    const id = req.params.id;
    res.redirect("urls/id", {
      urls: urlDatabase,
      });

});

// Update - POST /urls/:id/update
app.post("/urls/:id/update", (req, res) => {
  //console.log("the content of the form:", req.body);
  let shortURL=req.params.id;
  let longURL=req.body.longURL;
    // set this specific url to equal the contents of the form
    urlDatabase[shortURL] = longURL;
    res.render("urls_index",{urls:urlDatabase});

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});