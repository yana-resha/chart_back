require('ts-node/register');
require('../dist/common/db/pg-types'); 

module.exports = {
  "development": {
    "username": 'yana',
    "password": '9095',
    "database": 'natal_chart',
    "host": 'localhost',
    "dialect": "postgres"
  },
  "production": {
    "username": 'yana',
    "password": '9095',
    "database": 'natal_chart',
    "host": 'localhost',
    "dialect": "postgres"
  },
  seederStorage: 'sequelize'
}
