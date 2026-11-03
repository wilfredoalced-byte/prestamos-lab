'use strict';

// Migración: crea la tabla "equipos"
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('equipos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      codigo: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true, // cada equipo tiene un código único, ej: LAB-001
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      categoria: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      condicion: {
        // condición de uso: solo se aceptan estos valores
        type: Sequelize.ENUM('nuevo', 'bueno', 'regular', 'malo'),
        allowNull: false,
        defaultValue: 'bueno',
      },
      created_at: {

        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('equipos');
  },
};