'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // создаем удобные для связей колонки с id для admin1
    await queryInterface.addColumn('geonames_city', 'admin1_id', {
      type: Sequelize.STRING,
    });

    // Заполняем поле admin1_id значениями, конкатенированными через точку из country и admin1
    await queryInterface.sequelize.query(`
      UPDATE geonames_city
      SET admin1_id = CONCAT(country, '.', admin1)
      WHERE admin1 IS NOT NULL AND admin1 != '';
    `);

    // создаем удобные для связей колонки с id admin2
    await queryInterface.addColumn('geonames_city', 'admin2_id', {
      type: Sequelize.STRING,
    });


    // Заполняем поле admin1_id значениями, конкатенированными через точку из country и admin1
    await queryInterface.sequelize.query(`
      UPDATE geonames_city
      SET admin2_id = CONCAT(country, '.', admin1, '.', admin2)
      WHERE admin2 IS NOT NULL AND admin2 != '' AND admin1 IS NOT NULL AND admin1 != '';
    `);

    await queryInterface.removeColumn('geonames_city', 'admin1');
    await queryInterface.removeColumn('geonames_city', 'admin2');

    // Индексы для поиска по названию
    await queryInterface.addIndex('geonames_city', ['asciiname'], {
      name: 'idx_geonames_city_asciiname',
    });
    await queryInterface.addIndex('geonames_city', ['asciiname_ru'], {
      name: 'idx_geonames_city_asciiname_ru',
    });

    

    // Индексы для join-связей
    await queryInterface.addIndex('geonames_city', ['admin1_id'], {
      name: 'idx_geonames_city_admin1',
    });
    await queryInterface.addIndex('geonames_city', ['admin2_id'], {
      name: 'idx_geonames_city_admin2',
    });
    await queryInterface.addIndex('geonames_city', ['country'], {
      name: 'idx_geonames_city_country',
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем добавленные индексы
    await queryInterface.removeIndex('geonames_city', 'idx_geonames_city_asciiname');
    await queryInterface.removeIndex('geonames_city', 'idx_geonames_city_asciiname_ru');
    await queryInterface.removeIndex('geonames_city', 'idx_geonames_city_admin1');
    await queryInterface.removeIndex('geonames_city', 'idx_geonames_city_admin2');
    await queryInterface.removeIndex('geonames_city', 'idx_geonames_city_country');

    // Восстанавливаем колонки admin1 и admin2
    await queryInterface.addColumn('geonames_city', 'admin1', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('geonames_city', 'admin2', {
      type: Sequelize.STRING,
    });

    // Заполняем данные в эти поля обратно через UPDATE
    await queryInterface.sequelize.query(`
      UPDATE geonames_city
      SET admin1 = SUBSTRING(admin1_id FROM 4 FOR LENGTH(admin1_id) - LENGTH(SUBSTRING(admin1_id, 1, POSITION('.' IN admin1_id) - 1))),
          admin2 = SUBSTRING(admin2_id FROM 7 FOR LENGTH(admin2_id) - LENGTH(SUBSTRING(admin2_id, 1, POSITION('.' IN admin2_id) - 1)))
    `);

    // Удаляем admin1_id и admin2_id
    await queryInterface.removeColumn('geonames_city', 'admin1_id');
    await queryInterface.removeColumn('geonames_city', 'admin2_id');
  }
};
