const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const connectToMongo = async (callback) => {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://nodejscourse:tLUZcLfbE01uJY1M@cluster0.9srxm.mongodb.net/bookshop_review?retryWrites=true&w=majority"
    );
    _db = client.db();
    callback();
  } catch (err) {
    console.log(err);
  }
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

exports.connectToMongo = connectToMongo;
exports.getDb = getDb;
