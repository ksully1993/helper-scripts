/*
script to import fleet(customer) data to db using mongoose model

command line argument format:
node importFleets.js path/to/seed-file
*/

const seeder = require('./seeder');
const Fleet = require('../models/fleetModel');

seeder.connectDB();

// Import data into db on Fleets collection
const importData = async (query) => {
  try {
    await query;
    console.log(`Successfully imported data to Fleets collection!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Import documents to db without child references
const query = Fleet.create(seeder.loadFile());
importData(query);
