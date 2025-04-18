'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE geonames_country gcountry
      SET country_ru = city.asciiname_ru
      FROM geonames_city city
      WHERE gcountry.iso = city.country
        AND city.asciiname_ru IS NOT NULL
        AND city.fcode = 'HTL'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE geonames_admin_2 SET asciiname_ru = NULL;
    `);
  }
};
