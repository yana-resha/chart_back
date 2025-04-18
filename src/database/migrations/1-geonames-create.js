'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {


    // Пути к CSV-файлам
    const pathCountry = '/Users/yana/Desktop/study/natal_datas/translated_geonames/country.csv';
    const pathAdmin1 = '/Users/yana/Desktop/study/natal_datas/translated_geonames/admin_1.csv';
    const pathAdmin2 = '/Users/yana/Desktop/study/natal_datas/translated_geonames/admin_2.csv';
    const pathCity = '/Users/yana/Desktop/study/natal_datas/translated_geonames/city.csv';

    // Таблица geonames_country
    await queryInterface.createTable('geonames_country', {
      iso: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      name_ru: {
        type: Sequelize.STRING,
      },
    });

    await queryInterface.sequelize.query(`
      COPY geonames_country FROM '${pathCountry}' DELIMITER ',' CSV;`);
    await queryInterface.addIndex('geonames_country', ['iso'], { name: 'idx_geonames_country_iso' });
    await queryInterface.addIndex('geonames_country', ['name'], { name: 'idx_geonames_country_name' });
    await queryInterface.addIndex('geonames_country', ['name_ru'], { name: 'idx_geonames_country_name_ru' });

    // Таблица geonames_admin_1
    await queryInterface.createTable('geonames_admin_1', {
      geonameid: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      asciiname: {
        type: Sequelize.STRING,
      },
      asciiname_ru: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
    });

    await queryInterface.sequelize.query(`COPY geonames_admin_1 (geonameid, asciiname, asciiname_ru, country) FROM '${pathAdmin1}' DELIMITER ',' CSV;`);

    // Индексы для поиска
    await queryInterface.addIndex('geonames_admin_1', ['country'], { name: 'idx_geonames_admin_1_country' });
    await queryInterface.addIndex('geonames_admin_1', ['asciiname'], { name: 'idx_geonames_admin_1_asciiname' });
    await queryInterface.addIndex('geonames_admin_1', ['asciiname_ru'], { name: 'idx_geonames_admin_1_asciiname_ru' });

    // Комбинированный индекс для country и asciiname_ru
    await queryInterface.addIndex('geonames_admin_1', ['country', 'asciiname_ru'], { name: 'idx_geonames_admin_1_country_asciiname_ru' });
    await queryInterface.addIndex('geonames_admin_1', ['country', 'asciiname'], { name: 'idx_geonames_admin_1_country_asciiname' });

    // Таблица geonames_admin_2
    await queryInterface.createTable('geonames_admin_2', {
      geonameid: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      asciiname: {
        type: Sequelize.STRING,
      },
      asciiname_ru: {
        type: Sequelize.STRING,
      },
      admin1_id: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
    });

    await queryInterface.sequelize.query(`COPY geonames_admin_2 (geonameid, asciiname, asciiname_ru, country, admin1_id) FROM '${pathAdmin2}' WITH (FORMAT CSV, DELIMITER ',', QUOTE '"', NULL '');`);

    // Индексы для поиска
    await queryInterface.addIndex('geonames_admin_2', ['admin1_id'], { name: 'idx_geonames_admin_2_admin1_id' });
    await queryInterface.addIndex('geonames_admin_2', ['asciiname_ru'], { name: 'idx_geonames_admin_2_asciiname_ru' });
    await queryInterface.addIndex('geonames_admin_2', ['asciiname'], { name: 'idx_geonames_admin_2_asciiname' });

    // Комбинированный индекс для admin1_id и country
    await queryInterface.addIndex('geonames_admin_2', ['admin1_id', 'country'], { name: 'idx_geonames_admin_2_admin1_country' });

    // Таблица geonames_city
    await queryInterface.createTable('geonames_city', {
      geonameid: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      asciiname: {
        type: Sequelize.STRING,
      },
      asciiname_ru: {
        type: Sequelize.STRING,
      },
      latitude: {
        type: Sequelize.DECIMAL(12, 8),
      },
      longitude: {
        type: Sequelize.DECIMAL(12, 8),
      },
      elevation: {
        type: Sequelize.INTEGER,
      },
      country: {
        type: Sequelize.STRING,
      },
      admin1_id: {
        type: Sequelize.STRING,
      },
      admin2_id: {
        type: Sequelize.STRING,
      },
      time_zone: {
        type: Sequelize.STRING,
      },
    });

    await queryInterface.sequelize.query(`
        COPY geonames_city (geonameid, asciiname, latitude, longitude, country, elevation, time_zone, asciiname_ru, admin1_id, admin2_id)
        FROM '${pathCity}' WITH (FORMAT CSV, DELIMITER ',', QUOTE '"', NULL '');
    `);

    // Индексы для поиска
    await queryInterface.addIndex('geonames_city', ['admin1_id'], { name: 'idx_geonames_city_admin1_id' });
    await queryInterface.addIndex('geonames_city', ['admin2_id'], { name: 'idx_geonames_city_admin2_id' });
    await queryInterface.addIndex('geonames_city', ['asciiname_ru'], { name: 'idx_geonames_city_asciiname_ru' });
    await queryInterface.addIndex('geonames_city', ['asciiname'], { name: 'idx_geonames_city_asciiname' });
    await queryInterface.addIndex('geonames_city', ['geonameid'], { name: 'idx_geonames_city_geonameid' });

    // Комбинированный индекс для admin2_id и country
    await queryInterface.addIndex('geonames_city', ['admin2_id', 'country'], { name: 'idx_geonames_city_admin2_country' });

    // Комбинированный индекс для admin1_id и admin2_id
    await queryInterface.addIndex('geonames_city', ['admin1_id', 'admin2_id'], { name: 'idx_geonames_city_admin1_admin2' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('geonames_city');
    await queryInterface.dropTable('geonames_admin_2');
    await queryInterface.dropTable('geonames_admin_1');
    await queryInterface.dropTable('geonames_country');
  }
};
