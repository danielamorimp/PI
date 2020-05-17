const express = require ('express');
const bodyParser = require ('body-parser');
const csv = require('csv-parser');
const fs = require('fs');
const db = require ('./database/index');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

require('./app/controllers/index')(app);



app.listen(3000);