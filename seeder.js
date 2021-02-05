/*
Helper script to connect DB and load data file

DB and password should be defined in config.env file
Example: DATABASE=mongodb://localhost:27017/yourdbname
         DATABASE_PASSWORD=yourdbpassword 
*/

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const argv = require('minimist')(process.argv.slice(1));

dotenv.config({ path: '../config.env' });

exports.connectDB = () => {
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
};

// Load seed file from path specified
exports.loadFile = () => {
  const data = JSON.parse(fs.readFileSync(argv._[1], 'utf-8'));
  return data;
};
