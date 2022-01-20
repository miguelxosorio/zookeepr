const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const fs = require('fs');
const path = require('path');
const { animals } = require('./data/animals');
// parse incoming string or array data - is a method built into Express.js. It takes incoming POST data and converts it to key/value pairings that can be accessed in the req.body object.
// The extended: true option set inside the method call informs our server that there may be sub-array data nested in it as well, so it needs to look as deep into the POST data as possible to parse all of the data correctly.
app.use(express.urlencoded({ extended: true}));
// parse incoming JSON data - takes incoming POST data in the form of JSON and parses it into the req.body JavaScript object
app.use(express.json());
// The way it works is that we provide a file path to a location in our application (in this case, the public folder) and instruct the server to make these files static resources.
app.use(express.static('public'));

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;

    if(query.personalityTraits){
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save.
        if(typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through eachtrait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if(query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if(query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if(query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function findById(id, animalsArray){
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

function validateAnimal(animal) {
    if(!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if(!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if(!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if(!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false
    }
    return true;
}

function createNewAnimal(body, animalsArray) {
    console.log(body);
    // functions main code here
    const animal = body;
    animalsArray.push(animal);

    // We want to write to our animals.json file in the data subdirectory, so we use the method path.join() to join the value of __dirname,
    // which represents the directory of the file we execute the code in, with the path to the animals.json file.
    // Next, we need to save the JavaScript array data as JSON, so we use JSON.stringify() to convert it.
    // The other two arguments used in the method, null and 2, are means of keeping our data formatted.
    // The null argument means we don't want to edit any of our existing data; if we did, we could pass something in there.
    // The 2 indicates we want to create white space between our values to make it more readable.
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
    // return finished code to post route for response
    return animal;
}

app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send 400 error back
    if(!validateAnimal(req.body)) {
        res.status(400).send('THe animal is not properly formatted.');
    } else {

    }

    // add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);

    // req.body is where our incoming content will be
    console.log(req.body);
    res.json(animal);
});

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });

// get method requires two arguments, the first is a string that describes the route the client will have to fetch from.
// The second is a callback function that will execute everytime that route is accessed with a GET request.
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if(result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

// The * will act as a wildcard, meaning any route that wasn't previously defined will fall under this request and will receive the homepage as the response. 
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});

