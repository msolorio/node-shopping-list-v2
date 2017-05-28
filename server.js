
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {ShoppingList, Recipes} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

// log the http layer
app.use(morgan('common'));

// we're going to add some items to ShoppingList
// so there's some data to look at
ShoppingList.create('beans', 2);
ShoppingList.create('tomatoes', 3);
ShoppingList.create('peppers', 4);

// adding some recipes to `Recipes` so there's something
// to retrieve.
Recipes.create(
  'boiled white rice', ['1 cup white rice', '2 cups water', 'pinch of salt']);
Recipes.create(
  'milkshake', ['2 tbsp cocoa', '2 cups vanilla ice cream', '1 cup milk']);

// when the root of this router is called with GET, return
// all current ShoppingList items
app.get('/shopping-list', (req, res) => {
  res.json(ShoppingList.get());
});

// passing POST requests through jsonParser middleware
app.post('/shopping-list', jsonParser, (req, res) => {

  // check if required fields exist in request body
  const requiredFields = ['name', 'budget'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const item = ShoppingList.create(req.body.name, req.body.budget);
  res.status(201).json(item);
});


app.get('/recipes', (req, res) => {
  res.json(Recipes.get());
});

// breaking up error handling into functions
// ASK ABOUT THIS ONE
function checkRequiredFields(req, res, requiredFields) {
  requiredFields.forEach((field) => {
    if (!req.body[field]) {
      const message = `missing "${field}" field in request body.`;
      console.error(message);
      res.status(401).json({message: message});
    }
  });
}

function checkIfArray(req, res, fieldName, fieldValue) {
  if (!Array.isArray(fieldValue)) {
    const message = `${fieldName} field must be an array.`;
      console.error(message);
      res.status(401).json({message: message});
  }
}

app.post('/recipes', jsonParser, (req, res) => {
  
  // if required field not in request body
  // send error message
  checkRequiredFields(req, res, ['name', 'ingredients']);
  
  // if ingredients field is not an array
  // return an error
  checkIfArray(req, res, 'ingredients', req.body.ingredients);

  const recipe = Recipes.create(req.body.name, req.body.ingredients);
  res.status(201).json(recipe);
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
