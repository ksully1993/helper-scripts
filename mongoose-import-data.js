/* script to import json file data to db using mongoose models
command line argument format:
node import-data.js command model "name" path/to/file
Example: node import-data.js import Vehicle "Glasco Heating & Air Conditionging" data/vehicle-data.json
DB and password should be defined in config.env file
Example: DATABASE=mongodb://localhost:27017/yourdbname
         DATABASE_PASSWORD=yourdbpassword */

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const argv = require('minimist')(process.argv.slice(2));

// Models already defined in separate files
const Vehicle = require('../models/vehicleModel');
const Customer = require('../models/customerModel');
const Service = require('../models/serviceModel');
const Operator = require('../models/operatorModel');

// path to config.env file(from working directory, not relative path)
dotenv.config({ path: './config.env' });

// Connect to DB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch(() => {
    console.log('DB connection failed');
    process.exit();
  });

// Select correct model for query
let model = null;
switch (argv._[1]) {
  case 'Vehicle':
    model = Vehicle;
    break;
  case 'Customer':
    model = Customer;
    break;
  case 'Service':
    model = Service;
    break;
  case 'Operator':
    model = Operator;
    break;
  default:
    console.log('Invalid model.');
    process.exit();
}

// Import data into db on specified collection
const importData = async (query) => {
  try {
    await query;
    console.log(`Successfully imported data to ${argv._[1]} collection!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete all data from specified collection
const deleteData = async (query) => {
  try {
    await query;
    console.log(`Data deleted from ${argv._[1]} collection.`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Find document _id matching argument given
const fleetName = argv._[3];

// Load file from path specified
const loadFile = () => {
  const data = JSON.parse(fs.readFileSync(argv._[2], 'utf-8'));
  return data;
};

// Import or Delete based on cmd line args
if (argv._[0] === 'import') {
  const jsonFile = loadFile();
  // Find parent _id in db
  Customer.findOne({ name: fleetName }).then((customer) => {
    const ID = customer._id;
    // Update each document with new parent reference
    const updatedFile = [];
    jsonFile.forEach((el) => {
      el.customerID = ID;
      updatedFile.push(el);
    });
    // Import updated documents to db
    const query = model.create(updatedFile);
    importData(query);
  });
} else if (argv._[0] === 'delete') {
  const query = model.deleteMany();
  deleteData(query);
} else {
  return console.log('Incorrect or missing command');
}
