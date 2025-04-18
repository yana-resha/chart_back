'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // === geonames_admin_1 ===

    await queryInterface.addColumn('geonames_admin_1', 'country', {type: Sequelize.STRING(2)});

    await queryInterface.sequelize.query(`
      UPDATE geonames_admin_1
      SET country = split_part(geonameid, '.', 1);;
    `);

    await queryInterface.addIndex('geonames_admin_1', ['geonameid'], {
      name: 'idx_admin1_geonameid_code',
    });

    // === geonames_admin_2 ===
    await queryInterface.addColumn('geonames_admin_2', 'country', {type: Sequelize.STRING(2)});

    await queryInterface.sequelize.query(`
      UPDATE geonames_admin_2
      SET country = split_part(geonameid, '.', 1);
    `);

    await queryInterface.addIndex('geonames_admin_2', ['geonameid'], {
      name: 'idx_admin2_geonameid_code',
    });

    await queryInterface.addColumn('geonames_admin_2', 'admin1_id', {type: Sequelize.STRING});
    await queryInterface.sequelize.query(`
      UPDATE geonames_admin_2
      SET admin1_id = CONCAT(split_part(geonameid, '.', 1), '.', split_part(geonameid, '.', 2));
    `);

    // удаляю admin_id из записей если таков реально нет (проверила, действительно такой случай встречается)
    await queryInterface.sequelize.query(`
      UPDATE geonames_city
      SET admin2_id = NULL
      WHERE admin2_id IS NOT NULL
        AND admin2_id NOT IN (SELECT geonameid FROM geonames_admin_2);
    `);

    await queryInterface.sequelize.query(`
      UPDATE geonames_city
      SET admin1_id = NULL
      WHERE admin1_id IS NOT NULL
      AND admin1_id NOT IN (SELECT geonameid FROM geonames_admin_1);
    `);
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('geonames_admin_1', 'idx_admin1_geonameid_code');
    await queryInterface.removeIndex('geonames_admin_2', 'idx_admin2_geonameid_code');
    await queryInterface.removeColumn('geonames_admin_2', 'admin1_id');
  },
};
