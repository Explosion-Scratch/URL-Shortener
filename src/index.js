const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const storage = require("node-persist");

// Init node-persist
storage.init().then(() => {
  console.log("Storage initiated");
});

// Body parser
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Clicks from a url
app.get("/:id/clicks", (req, res) => {
  var id = req.path.replace(/^\//, "").replace(/\/clicks$/, "");
  storage
    .getItem("clicks-" + id)
    .then((clicks) => {
      if (clicks == undefined) {
        res.json({ error: "Link does not exist", link: id });
      } else {
        res.json({ clicks: clicks });
      }
    })
    .catch((err) => {
      res.json({ error: "Error! " + err });
    });
});

// Get urls list
app.get("/urls", (req, res) => {
  storage
    .getItem("urls")
    .then((urls) => {
      res.json({ urls: urls.replace(/^undefined,/, "") });
    })
    .catch((err) => {});
});

// Add a new url
app.post("/url", (req, res) => {
  storage.getItem("urls").then((urls) => {
    storage.setItem("urls", urls + "," + req.body.id);
  });
  storage.setItem("url-" + req.body.id, req.body.url);
  storage.setItem("clicks-" + req.body.id, 0);
  res.redirect("/");
});

// Apply this to all pages
app.get("/:thisdosentmatter", (req, res) => {
  var id = req.path.replace(/^\//, "");
  storage
    .getItem("url-" + id)
    .then((value) => {
      if (value == undefined) {
        res.redirect("/");
      } else {
        storage.getItem("clicks-" + id).then((clicks) => {
          storage.setItem("clicks-" + id, clicks + 1);
        });
        res.redirect(value);
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
});

// Get port
const port = process.env.PORT || 3000;
// Listen
app.listen(port, () => {
  console.log("Listening on port " + port);
});
