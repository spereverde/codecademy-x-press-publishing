const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const app = express();

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})


module.exports = app;