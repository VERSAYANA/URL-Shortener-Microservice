'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  url: String,
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl/new", (req, res) => {
  const urlReg = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm

  if (urlReg.test(req.body.url)) {
    Url.countDocuments({}, (err, count) => {
      if (err) {
        console.error(err);
      } else {
        Url.create({
          url: req.body.url,
          short_url: count
                }, (err, data) => {
          // console.log(data);
          if (err) {
            console.error(err);
          } else {
            res.json({
              original_url: data.url,
              short_url: data.short_url
            })
          }
        })
      }
    })
  } else {
    res.json({ error: "invalid URL" })
  }

})

app.get("/api/shorturl/:short_url", (req, res) => {
  Url.findOne({short_url: req.params.short_url}, (err, data) => {
    res.redirect(data.url)
  })
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});