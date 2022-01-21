const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
// const fs = require('fs');
// const path = require('path');
// const { animals } = require('./data/animals');
const apiRoutes = require('./routes/apiRoutes');
const htmlRoutes = require('./routes/htmlRoutes');
// parse incoming string or array data - is a method built into Express.js. It takes incoming POST data and converts it to key/value pairings that can be accessed in the req.body object.
// The extended: true option set inside the method call informs our server that there may be sub-array data nested in it as well, so it needs to look as deep into the POST data as possible to parse all of the data correctly.
app.use(express.urlencoded({ extended: true}));
// parse incoming JSON data - takes incoming POST data in the form of JSON and parses it into the req.body JavaScript object
app.use(express.json());
// The way it works is that we provide a file path to a location in our application (in this case, the public folder) and instruct the server to make these files static resources.
app.use(express.static('public'));
// Use apiRoutes
app.use('/api', apiRoutes);
app.use('/', htmlRoutes);

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});

