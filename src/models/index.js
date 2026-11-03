const { Sequelize } = require('sequelize');
const config = require('../../config/config.js').development;

// Conexión a MySQL usando los datos del .env
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Cargar los modelos
const Usuario = require('./usuario')(sequelize);
const Equipo = require('./equipo')(sequelize);
const Prestamo = require('./prestamo')(sequelize);

// RELACIONES
// Un usuario registra varios préstamos
Usuario.hasMany(Prestamo, { foreignKey: 'usuario_id', as: 'prestamos' });
Prestamo.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'registradoPor' });

// Un equipo conserva varios préstamos históricos
Equipo.hasMany(Prestamo, { foreignKey: 'equipo_id', as: 'prestamos' });
Prestamo.belongsTo(Equipo, { foreignKey: 'equipo_id', as: 'equipo' });

module.exports = { sequelize, Usuario, Equipo, Prestamo };