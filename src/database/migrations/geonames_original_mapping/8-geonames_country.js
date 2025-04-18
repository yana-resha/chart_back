'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('geonames_country', {
      iso: {
        type: Sequelize.STRING(2),
        unique: true,
        primaryKey: true,
      },
      iso3: {
        type: Sequelize.STRING,
      },
      iso_numeric: {
        type: Sequelize.BIGINT,
      },
      fips: {
        type: Sequelize.STRING(2),
      },
      country: {
        type: Sequelize.STRING,
      },
      capital: {
        type: Sequelize.STRING,
      },
      area: {
        type: Sequelize.FLOAT,
      },
      population: {
        type: Sequelize.FLOAT,
      },
      continent: {
        type: Sequelize.STRING,
      },
      tld: {
        type: Sequelize.STRING,
      },
      currency_code: {
        type: Sequelize.STRING,
      },

      currency_code: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      code_format: {
        type: Sequelize.STRING,
      },
      code_regex: {
        type: Sequelize.STRING,
      },
      languages: {
        type: Sequelize.STRING,
      },
      geonameid: {
        type: Sequelize.STRING,
      },
      neighbours: {
        type: Sequelize.STRING,
      },
      fips_code: {
        type: Sequelize.STRING,
      },
      fips_code_1: {
        type: Sequelize.STRING,
      },
    })
    await queryInterface.sequelize.query(`COPY public. geonames_country FROM '/Users/yana/Desktop/study/natal_datas/datas/countryInfo.txt' WITH(format text, null '')`)
    await queryInterface.removeColumn('geonames_country', 'iso3');
    await queryInterface.removeColumn('geonames_country', 'iso_numeric');
    await queryInterface.removeColumn('geonames_country', 'fips');
    await queryInterface.removeColumn('geonames_country', 'capital');
    await queryInterface.removeColumn('geonames_country', 'area');
    await queryInterface.removeColumn('geonames_country', 'population');
    await queryInterface.removeColumn('geonames_country', 'continent');
    await queryInterface.removeColumn('geonames_country', 'tld');
    await queryInterface.removeColumn('geonames_country', 'currency_code');
    await queryInterface.removeColumn('geonames_country', 'phone');
    await queryInterface.removeColumn('geonames_country', 'code_format');
    await queryInterface.removeColumn('geonames_country', 'code_regex');
    await queryInterface.removeColumn('geonames_country', 'languages');
    await queryInterface.removeColumn('geonames_country', 'geonameid');
    await queryInterface.removeColumn('geonames_country', 'neighbours');
    await queryInterface.removeColumn('geonames_country', 'fips_code');
    await queryInterface.removeColumn('geonames_country', 'fips_code_1');

    await queryInterface.addColumn('geonames_country', 'country_ru', {type: Sequelize.STRING});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('geonames_country');
  }
};
