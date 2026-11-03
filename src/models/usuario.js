const { DataTypes } = require('sequelize');

// Modelo Usuario → tabla "usuarios"
module.exports = (sequelize) => {
  return sequelize.define('Usuario', {
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
  }, {
    tableName: 'usuarios',
    underscored: true, // usa created_at y updated_at
    // Por seguridad, el hash NUNCA se devuelve en las consultas normales
    defaultScope: { attributes: { exclude: ['password_hash'] } },
    scopes: { conPassword: { attributes: { include: ['password_hash'] } } },
  });
};