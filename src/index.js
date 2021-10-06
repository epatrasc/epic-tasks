require('dotenv').config();

const got = require('got');
const MongoSingleton = require('./db/mongodb-singleton');

const mongoUri = process.env.MONGODB_STRING_DEV;

const client = MongoSingleton.getClient(mongoUri);

(async () => {
  // Task 1: retrieve operationtasks
  const operationtasks = await got.get('https://backend-staging.epicuramed.it/operationtasks').json() || {};

  // Task 2: get list of unique operationType
  const operationTypeIds = operationtasks.map((task) => task.operationType.id);
  const operationTypes = operationtasks.map((task) => task.operationType).filter((task, i) => operationTypeIds.indexOf(task.id) === i);

  // Task 3: get list of unique disciplines
  const disciplinesIds = Object.keys(operationTypes.reduce((acc, operationType) => ({ ...acc, [operationType.discipline]: 1 }), {}));

  // Task 4: retrieve disciplines
  const disciplinesPromises = disciplinesIds.map((discipline) => got.get(`https://backend-staging.epicuramed.it/disciplines/${discipline}`).json());
  const results = await Promise.allSettled(disciplinesPromises);
  const disciplines = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  console.log(disciplines);

  // Task 5: save on db
  try {
    await client.connect();
    const database = await client.db('epic-db');
    await database.collection('discipline').remove({});
    await database.collection('operationType').remove({});

    const operationResult = [
      await database.collection('discipline').insertMany(disciplines),
      await database.collection('operationType').insertMany(operationTypes),
    ];
    console.log(operationResult);
  } catch (error) {
    console.log(error);
  }
  client.close();
})();
