require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
const shortenUrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const ShortURLModel = mongoose.model('shortenurl', shortenUrlSchema);

const saveShortUrl = (original_url, short_url) => {
  const shortUrl = new ShortURLModel({ original_url, short_url });
  shortUrl.save((err, data) => {
    if (err) {
      console.error('error: ', err);
    }
  });
};

const getMaxShortUrl = async () => {
  const maxShortUrl = await ShortURLModel.findOne().sort({ short_url: -1 });
  return maxShortUrl.short_url;
}

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', function(req, res) {
  console.log(req.body);
  const urlObj = new URL(req.body.url);
  const urlHostName = urlObj.hostname;
  dns.lookup(urlHostName, async (err) => {
    if (err) {
      console.error('error: ', [urlHostName, err]);
      res.json({ error: 'invalid url' });
    } else {
      const maxShortUrl = await getMaxShortUrl();
      const shortUrl = maxShortUrl + 1;
      saveShortUrl(req.body.url, shortUrl);
      res.json({ original_url: req.body.url, short_url: shortUrl });
    }
  });
});
  
app.get("/api/shorturl/:id", (req, res) => {
  const shortUrl = req.params.id;
  ShortURLModel.findOne({ short_url: shortUrl }, (err, data) => {
    if (err) {
      console.error('error: ', err);
    }
    res.redirect(data.original_url);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
