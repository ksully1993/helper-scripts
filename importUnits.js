/*
script to import fleet(customer) data to db using mongoose model

command line argument format:
node importFleets.js path/to/seed-file "fleetID"
*/

const seeder = require('./seeder');
const Unit = require('../models/unitModel');
const Fleet = require('../models/fleetModel');

seeder.connectDB();

// Import data into db on Fleets collection
const importData = async (query) => {
  try {
    await query;
    console.log(`Successfully imported data to Units collection!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// TODO import and update reference IDs at same time.

// add fleetID reference to sub documents
const jsonFile = seeder.loadFile();
// save fleet ID from command line
const fleetID = argv._[2];

// add fleet ID to unit documents if it exists in db
Fleet.findOne({ _id: ObjectId(fleetID) }).then(() => {
  const updatedFile = [];
  jsonFile.forEach((el) => {
    el.fleetID = fleetID;
    updatedFile.push(el);
  });
  // Import updated documents to db
  const query = Unit.create(updatedFile);
  importData(query);
});
