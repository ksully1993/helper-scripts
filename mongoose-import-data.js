// command line argument format:
// node import-data.js model command path/to/file
// DB and password should be defined in config.env file
// Example: DATABASE=mongodb://localhost:27017/yourdbname
//          DATABASE_PASSWORD=yourdbpassword

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Vehicle = require('../models/vehicleModel');
const Customer = require('../models/customerModel');
const Service = require('../models/serviceModel');
const Operator = require('../models/operatorModel');

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

const jsonFile = JSON.parse(fs.readFileSync(process.argv[4], 'utf-8'));
if (!jsonFile) {
  return console.log('File not found. Verify path and try again.');
}

// Select correct model for query
let model;
switch (process.argv[2]) {
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
    console.log(`Successfully imported data to ${process.argv[2]} collection!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete all data from specified collection
const deleteData = async (query) => {
  try {
    await query;
    console.log(`Data deleted from ${process.argv[2]} collection.`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Import or Delete based on cmd line args
if (process.argv[3] === '--import') {
  const query = model.create(jsonFile);
  importData(query);
} else if (process.argv[3] === '--delete') {
  const query = model.deleteMany();
  deleteData(query);
} else {
  return console.log('Incorrect or missing command');
}
