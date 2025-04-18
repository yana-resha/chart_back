'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE geonames_admin_2 admin2
      SET asciiname_ru = city.asciiname_ru
      FROM geonames_city city
      WHERE admin2.geonameid = city.admin2_id
        AND city.asciiname_ru IS NOT NULL
        AND city.fcode = 'ADM2'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE geonames_admin_2 SET asciiname_ru = NULL;
    `);
  }
};
