'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.createTable('geonames_city', {
      geonameid: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
      },
      asciiname: {
        type: Sequelize.STRING(200),
      },
      alternatenames: {
        type: Sequelize.TEXT,
      },
      latitude: {
        type: Sequelize.DECIMAL(12, 8),
      },
      longitude: {
        type: Sequelize.DECIMAL(12, 8),
      },
      fclass: {
        type: Sequelize.STRING(1),
      },
      fcode: {
        type: Sequelize.STRING(10),
      },
      country: {
        type: Sequelize.STRING(2),
      },
      cc2: {
        type: Sequelize.STRING(200),
      },
      admin1: {
        type: Sequelize.STRING(20),
      },
    
      admin2: {
        type: Sequelize.STRING(80),
      },
      admin3: {
        type: Sequelize.STRING(20),
      },
      admin4: {
        type: Sequelize.STRING(20),
      },
      population: {
        type: Sequelize.BIGINT,
      },
      elevation: {
        type: Sequelize.INTEGER,
      },
      gtopo30: {
        type: Sequelize.INTEGER,
      },
      time_zone: {
        type: Sequelize.STRING(40),
      },
      mod_date: {
        type: Sequelize.DATE,
      },
    })
    // копирую данные из файла allCountries.txt в новую таблицу и удаляю лишние колонки
    await queryInterface.sequelize.query(`
      COPY public.geonames_city FROM '/Users/yana/Desktop/study/natal_datas/datas/allCountries.txt' WITH(format text, null '');
      ALTER TABLE public.geonames_city DROP COLUMN mod_date, DROP COLUMN gtopo30, DROP COLUMN population, DROP COLUMN alternatenames, DROP COLUMN admin3, DROP COLUMN admin4, DROP COLUMN cc2, DROP COLUMN name;
    `)

    // добавляю новую колону, чтобы далее заполнить ее переводом
    await queryInterface.addColumn('geonames_city', 'asciiname_ru', {type: Sequelize.STRING});

    await queryInterface.sequelize.query(`
      UPDATE public.geonames_city gc
      SET asciiname_ru = an.alternate_name
      FROM public.alternate_names an
      WHERE
        an.geoname_id = gc.geonameid
    `);

    // удаляю лишние колонки из таблицы geonames_city
    await queryInterface.removeColumn('geonames_city', 'fclass');
    await queryInterface.removeColumn('geonames_admin_1', 'fcode');
    
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('geonames_city');
  }
};


