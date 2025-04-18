'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('geonames_admin_2', {
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
    await queryInterface.sequelize.query(`COPY public.geonames_admin_2 FROM '/Users/yana/Desktop/study/natal_datas/datas/admin2Codes.txt' WITH(format text, null '')`)
    await queryInterface.removeColumn('geonames_admin_2', 'ind');
    await queryInterface.removeColumn('geonames_admin_2', 'name');

    await queryInterface.addColumn('geonames_admin_2', 'asciiname_ru', {type: Sequelize.STRING(200)});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('geonames_admin_2');
  }
};