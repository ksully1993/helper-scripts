/* script to import json file data to db using mongoose models

command line argument format:
node import-data.js command model path/to/seed-file "fleetName"

COMMANDS: 
"import" - Import documents to db without reference IDs
"update" - add fleetID reference to sub documents
"updateFleet" - add sub document IDs to fleet documents after importing sub documents
"delete" - delete all documents from collection

MODELS:
"Unit", "Fleet", "Service", "Operator"

DB and password should be defined in config.env file
Example: DATABASE=mongodb://localhost:27017/yourdbname
         DATABASE_PASSWORD=yourdbpassword */

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const argv = require('minimist')(process.argv.slice(2));

const Unit = require('../models/unitModel');
const Fleet = require('../models/fleetModel');
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

// Select correct model for query
let model = null;
switch (argv._[1]) {
  case 'Unit':
    model = Unit;
    break;
  case 'Fleet':
    model = Fleet;
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

// Name of fleet
const fleetName = argv._[3];

// Load seed file from path specified
const loadFile = () => {
  const data = JSON.parse(fs.readFileSync(argv._[2], 'utf-8'));
  return data;
};

if (argv._[0] === 'import') {
  // Import documents to db without reference IDs
  const jsonFile = loadFile();
  const query = model.create(jsonFile);
  importData(query);
} else if (argv._[0] === 'update') {
  // add fleetID reference to sub documents
  const jsonFile = loadFile();
  // Find parent _id in db
  Fleet.findOne({ name: fleetName }).then((fleet) => {
    const fleet_ID = fleet._id;
    // Update each document with new fleet reference
    const updatedFile = [];
    jsonFile.forEach((el) => {
      el.fleetID = fleet_ID;
      updatedFile.push(el);
    });
    // Import updated documents to db
    const query = model.create(updatedFile);
    importData(query);
  });
} else if (argv._[0] === 'updateFleet') {
  // add sub document IDs to fleet data after importing sub documents
  let unitsArray = [];
  let fleetId;
  // find fleet by id
  Fleet.findOne({ name: fleetName })
    .then(async (fleet) => {
      fleetId = fleet._id;
      console.log(`FleetID: ${fleetId}`);
      // find vehicles with fleetID matching fleet._id
      const vehicles = await Vehicle.find({ fleetID: fleetId }, function (
        err,
        result
      ) {
        if (err) {
          console.log(err);
        } else {
          return result;
        }
      });
      // add the unit._id to fleet units array
      vehicles.forEach((el) => {
        unitsArray.push(el._id);
        console.log(`Unit found: ${el._id}`);
      });
    })
    .then(async () => {
      const updatedFleet = await Fleet.findByIdAndUpdate(fleetId, {
        units: unitsArray,
      });
      console.log('Updating fleet...');
      return updatedFleet;
    })
    .then((updatedFleet) => {
      console.log(
        `${updatedFleet}\nFleet updated successfully with ${updatedFleet.units.length} units!`
      );
      process.exit();
    })
    .catch((err) => {
      console.log(err);
      process.exit();
    });

} else if (argv._[0] === 'delete') {
  // delete all documents from collection
  const query = model.deleteMany();
  deleteData(query);
} else {
  return console.log('Incorrect or missing command');
}
