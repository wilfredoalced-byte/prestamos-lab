const { DataTypes } = require('sequelize');

// Modelo Prestamo → tabla "prestamos"
module.exports = (sequelize) => {
  return sequelize.define('Prestamo', {
    equipo_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    prestatario: { type: DataTypes.STRING(120), allowNull: false },
    fecha_prestamo: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_prevista: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_devolucion: { type: DataTypes.DATEONLY, allowNull: true }, // null = activo
  }, {
    tableName: 'prestamos',
    underscored: true,
  });
};