const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const apiRouter = require('./api/api');
const app = express();

const PORT = process.env.PORT || 4001;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(errorhandler());

app.use('/api', apiRouter);

//app.get('/', (req, res, next) => {
//    res.send("<h1>Welcome to X-Press Publishing</h1>");
//});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;