'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE geonames_admin_1 admin1
      SET asciiname_ru = city.asciiname_ru
      FROM geonames_city city
      WHERE admin1.geonameid = city.admin1
        AND city.asciiname_ru IS NOT NULL
        AND city.fcode = 'ADM1'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE geonames_admin_1 SET asciiname_ru = NULL;
    `);
  }
};
