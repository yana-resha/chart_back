module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Связь между geonames_city и geonames_admin_2
/*     await queryInterface.addConstraint('geonames_city', {
      fields: ['admin2_id'],
      type: 'foreign key',
      name: 'fk_geonames_city_admin2',
      references: {
        table: 'geonames_admin_2',
        field: 'geonameid',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // если потребуется, можно изменить на 'SET NULL' или 'CASCADE'
    }); */

    // Связь между geonames_city и geonames_admin_1 через admin1_id
/*     await queryInterface.addConstraint('geonames_city', {
      fields: ['admin1_id'],
      type: 'foreign key',
      name: 'fk_geonames_city_admin1',
      references: {
        table: 'geonames_admin_1',
        field: 'geonameid',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // если потребуется, можно изменить на 'SET NULL' или 'CASCADE'
    }); */

    // Связь между geonames_city и geonames_country через country
/*     await queryInterface.addConstraint('geonames_city', {
      fields: ['country'],
      type: 'foreign key',
      name: 'fk_geonames_city_country',
      references: {
        table: 'geonames_country',
        field: 'iso',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // если потребуется, можно изменить на 'SET NULL' или 'CASCADE'
    }); */

    // Связь между geonames_admin_2 и geonames_admin_1 через admin1_id
    await queryInterface.addConstraint('geonames_admin_2', {
      fields: ['admin1_id'],
      type: 'foreign key',
      name: 'fk_geonames_admin2_admin1',
      references: {
        table: 'geonames_admin_1',
        field: 'geonameid',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // если потребуется, можно изменить на 'SET NULL' или 'CASCADE'
    });

    // Связь между geonames_admin_1 и geonames_country через country
    await queryInterface.addConstraint('geonames_admin_1', {
      fields: ['country'],
      type: 'foreign key',
      name: 'fk_geonames_admin1_country',
      references: {
        table: 'geonames_country',
        field: 'iso',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // если потребуется, можно изменить на 'SET NULL' или 'CASCADE'
    });

    // Связь между geonames_admin_2 и geonames_country через country
    await queryInterface.addConstraint('geonames_admin_2', {
      fields: ['country'],
      type: 'foreign key',
      name: 'fk_geonames_admin2_country',
      references: {
        table: 'geonames_country',
        field: 'iso',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // если потребуется, можно изменить на 'SET NULL' или 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Удаление связей при откате миграции
    await queryInterface.removeConstraint('geonames_city', 'fk_geonames_city_admin2');
    await queryInterface.removeConstraint('geonames_city', 'fk_geonames_city_admin1');
    await queryInterface.removeConstraint('geonames_city', 'fk_geonames_city_country');
    await queryInterface.removeConstraint('geonames_admin_2', 'fk_geonames_admin2_admin1');
    await queryInterface.removeConstraint('geonames_admin_1', 'fk_geonames_admin1_country');
    await queryInterface.removeConstraint('geonames_admin_2', 'fk_geonames_admin2_country');
  },
};