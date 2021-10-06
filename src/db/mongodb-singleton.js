require('dotenv').config();

const { MongoClient } = require('mongodb');

module.exports = class MongoSingleton {
  constructor(mongoUri) {
    this.mongoUri = mongoUri;
    this.mongoClient = undefined;
  }

  static isInitialized() {
    return this.mongoClient !== undefined;
  }

  static getClient(mongoUri) {
    if (!this.mongoUri) {
      this.mongoUri = mongoUri;
    }

    if (this.isInitialized()) return this.mongoClient;

    this.mongoClient = new MongoClient(this.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return this.mongoClient;
  }
};
