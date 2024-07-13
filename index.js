require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl/new", (req, res, next) => {
  try {
    const urlObj = new URL(req.body.url);
    next();
  } catch (error) {
    console.error('error: ', req.body.url);
    res.json({error: 'invalid url'})
  }
})

app.post("/api/shorturl/new", (req, res, next) => {
  
  req.state = {
    longUrl: '',
    shortUrl: ''
  };
  
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
      if ((url.startsWith("https://")) ||(url.startsWith("http://")) ||(url.startsWith("ftp://"))) 
      {
        req.state.longUrl = url;
      } 
      else 
      {
        req.state.longUrl = `http://${url}`;
      }
      
      next();
    }
    
  })
  
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
