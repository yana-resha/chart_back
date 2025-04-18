'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Создание таблицы
    await queryInterface.createTable('alternate_names', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      geoname_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      iso_language: {
        type: Sequelize.STRING(7),
        allowNull: true,
      },
      alternate_name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_preferred_name: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      is_short_name: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      is_colloquial: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      is_historic: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      from: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      to: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });

    // Импорт данных через COPY
    const sql = `COPY public.alternate_names FROM '/Users/yana/Desktop/study/natal_datas/datas/alternateNamesV2.txt' WITH(format text, null '');`;
    await queryInterface.sequelize.query(sql);

    // Удаление всех строк, кроме русских названий
    await queryInterface.sequelize.query(`
      DELETE FROM alternate_names
      WHERE NOT (
        iso_language = 'ru' AND
        alternate_name ~ '^[А-Яа-яЁё\\s\\-]+$'
      );
    `);

    // Индексы
    await queryInterface.addIndex('alternate_names', ['geoname_id']);
    await queryInterface.addIndex('alternate_names', ['iso_language']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('alternate_names');
  }
};