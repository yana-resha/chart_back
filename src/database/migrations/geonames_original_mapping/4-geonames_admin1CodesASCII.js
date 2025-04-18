'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('geonames_admin_1', {
      geonameid: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      asciiname: {
        type: Sequelize.STRING,
      },
      ind: {
        type: Sequelize.STRING,
      }
    })
    await queryInterface.sequelize.query(`COPY public.geonames_admin_1 FROM '/Users/yana/Desktop/study/natal_datas/datas/admin1CodesASCII.txt' WITH(format text, null '')`)
    await queryInterface.removeColumn('geonames_admin_1', 'ind');
    await queryInterface.removeColumn('geonames_admin_1', 'name');

    await queryInterface.addColumn('geonames_admin_1', 'asciiname_ru', {type: Sequelize.STRING(200)});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('geonames_admin_1');
  }
};