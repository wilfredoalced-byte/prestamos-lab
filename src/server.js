require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Primero verifica la conexión con MySQL y luego enciende el servidor
async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a MySQL:', error.message);
    process.exit(1);
  }
}

iniciar();