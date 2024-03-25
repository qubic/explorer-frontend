const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();

const myLimit = typeof process.argv[2] !== 'undefined' ? process.argv[2] : '500kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all('*', function (req, res, next) {
  // allow CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE');
  res.header('Access-Control-Allow-Headers', req.header('access-control-request-headers'));

  if (req.method === 'OPTIONS') {
    // CORS Preflight
    res.send();
  } else {
    const targetURL = 'https://api.qubic.li'; // target API to send request to
    if (!targetURL) {
      res.send(500, { error: 'There is no Target-Endpoint header in the request' });
      return;
    }
    console.log(`API CALL: ${req.method}\t${targetURL}${req.url}`);
    request(
      {
        url: targetURL + req.url,
        method: req.method,
        json: req.body,
        headers: { Authorization: req.header('Authorization') },
      },
      function (error, response, body) {
        if (error) {
          console.error(`error: ${response}`);
        }
      }
    ).pipe(res);
  }
});

app.set('port', 7003);

app.listen(app.get('port'), function () {
  console.log(`Proxy server listening on port ${app.get('port')}`);
});
