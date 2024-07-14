require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

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
urlCounter = 0;


app.post("/api/shorturl", (req, res, next) => {
  
  req.state = {
    longUrl: '',
    shortUrl: ''
  };
  console.log('req.body: ', req.body.url);
  if (urlCounter === 0) {
    urlCounter = 1;
  } else {
    urlCounter++;
  }
  const url = req.body.url;
  const urlObj = new URL(req.body.url);
  const urlHostName = urlObj.hostname;
  
  dns.lookup(urlHostName, (err) => {
    if (err)
    {
      console.error('error: ', [urlHostName, err]);
      res.json({error: 'invalid url'})
    }
    else
    {
      req.state.shortUrl = urlCounter;
      if ((url.startsWith("https://")) ||(url.startsWith("http://")) ||(url.startsWith("ftp://"))) 
      {
        req.state.longUrl = url;
      }
      else
      {
        req.state.longUrl = `http://${url}`;
      }
      next();
      console.log('req.state: ', req.state);
    }
  })
  console.log('urlCounter: ', urlCounter);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
