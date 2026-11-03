'use strict';

// Migración: crea la tabla "prestamos" con sus relaciones
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prestamos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      equipo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'equipos', key: 'id' }, // FK hacia equipos
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // NO deja borrar un equipo que tiene préstamos
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' }, // FK hacia usuarios (quién registró)
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      prestatario: {
        type: Sequelize.STRING(120),
        allowNull: false, // persona que recibe el equipo
      },
      fecha_prestamo: {
        type: Sequelize.DATEONLY,

        allowNull: false,
      },
      fecha_prevista: {
        type: Sequelize.DATEONLY,
        allowNull: false, // fecha en que debería devolverse
      },
      fecha_devolucion: {
        type: Sequelize.DATEONLY,
        allowNull: true, // NULL = préstamo ACTIVO
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

    // Índice para buscar rápido los préstamos activos de un equipo
    await queryInterface.addIndex('prestamos', ['equipo_id', 'fecha_devolucion'], {
      name: 'idx_prestamos_equipo_activo',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('prestamos');
  },
};