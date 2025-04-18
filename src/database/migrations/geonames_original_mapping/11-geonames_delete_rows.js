'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DELETE FROM public.geonames_city WHERE fclass != 'P'`);

    await queryInterface.sequelize.query(`
      DELETE FROM public.geonames_admin_2
      WHERE (country, admin1_code, admin2_code) NOT IN (
        SELECT DISTINCT country, admin1, admin2
        FROM public.geonames_city
        WHERE admin2 IS NOT NULL
      );
    `);

    // Удаление неиспользуемых admin1
    await queryInterface.sequelize.query(`
      DELETE FROM public.geonames_admin_1
      WHERE (country, admin1_code) NOT IN (
        SELECT DISTINCT country, admin1
        FROM public.geonames_city
        WHERE admin1 IS NOT NULL
      );
    `);

    // Удаление неиспользуемых стран
    await queryInterface.sequelize.query(`
      DELETE FROM public.geonames_country
      WHERE iso NOT IN (
        SELECT DISTINCT country
        FROM public.geonames_city
        WHERE country IS NOT NULL
      );
    `);
    // удаление таблицы altername_names
    await queryInterface.dropTable('alternate_names');
  },

  async down(queryInterface, Sequelize) {
    console.warn('⚠️  Откат невозможен: удалённые строки не сохраняются.');
  }
};
