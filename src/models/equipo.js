const { DataTypes } = require('sequelize');

// Modelo Equipo → tabla "equipos"
module.exports = (sequelize) => {
  return sequelize.define('Equipo', {
    codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    categoria: { type: DataTypes.STRING(60), allowNull: false },
    condicion: {
      type: DataTypes.ENUM('nuevo', 'bueno', 'regular', 'malo'),
      allowNull: false,
      defaultValue: 'bueno',
    },
  }, {
    tableName: 'equipos',
    underscored: true,
  });
};