const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');

const logFile = path.join(__dirname, '..', 'log.csv');

app.use((req, res, next) => {
// write your logging code here
  const agent = (req.headers['user-agent'] || '').replace(/,/g, '');
  const time = new Date().toISOString();
  const method = req.method;
  const resource = req.url;
  const version = `HTTP/${req.httpVersion}`;
  const status = res.statusCode;
  const line = `${agent},${time},${method},${resource},${version},${status}`;

  console.log(line);

  fs.appendFile(logFile, line + '\n', (err) => {
    if (err) console.error(err);
  });

  next();
});

app.get('/', (req, res) => {
// write your code to respond "ok" here
res.status(200).send('ok');
});

app.get('/logs', (req, res) => {
// write your code to return a json object containing the log data here
fs.readFile(logFile, 'utf8', (err, data) => {
    if (err) return res.status(500).send(err.message);

    const lines = data.split(/\r?\n/).filter(l => l.trim() !== '');
    const headers = lines.shift().split(',');

    const logs = lines.map(l => {
      const values = l.split(',');
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i]; });
      return obj;
    });

    res.json(logs);
  });
});

module.exports = app;
