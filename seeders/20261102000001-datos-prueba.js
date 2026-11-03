'use strict';

// Seeder: datos de prueba FICTICIOS
// Contraseña de los usuarios de prueba: Clave123
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    // La contraseña se guarda cifrada (hash), nunca en texto plano
    const hash = await bcrypt.hash('Clave123', 10);
    const ahora = new Date();

    // 2 usuarios ficticios
    await queryInterface.bulkInsert('usuarios', [
      { id: 1, nombre: 'Ana Prueba', correo: 'ana@ejemplo.com', password_hash: hash, created_at: ahora, updated_at: ahora },
      { id: 2, nombre: 'Luis Demo', correo: 'luis@ejemplo.com', password_hash: hash, created_at: ahora, updated_at: ahora },
    ]);

    // 4 equipos de laboratorio
    await queryInterface.bulkInsert('equipos', [
      { id: 1, codigo: 'LAB-001', nombre: 'Multímetro digital', categoria: 'Medición', condicion: 'bueno', created_at: ahora, updated_at: ahora },
      { id: 2, codigo: 'LAB-002', nombre: 'Osciloscopio', categoria: 'Medición', condicion: 'nuevo', created_at: ahora, updated_at: ahora },
      { id: 3, codigo: 'LAB-003', nombre: 'Laptop HP', categoria: 'Cómputo', condicion: 'regular', created_at: ahora, updated_at: ahora },
      { id: 4, codigo: 'LAB-004', nombre: 'Proyector Epson', categoria: 'Audiovisual', condicion: 'bueno', created_at: ahora, updated_at: ahora },
    ]);

    // 2 préstamos: uno ya devuelto y uno activo
    await queryInterface.bulkInsert('prestamos', [
      // Devuelto (tiene fecha_devolucion) → historial del equipo 1
      { equipo_id: 1, usuario_id: 1, prestatario: 'Estudiante Ficticio Uno', fecha_prestamo: '2026-10-20', fecha_prevista: '2026-10-22', fecha_devolucion: '2026-10-22', created_at: ahora, updated_at: ahora },
      // Activo (fecha_devolucion = null) → el equipo 3 NO está disponible
      { equipo_id: 3, usuario_id: 2, prestatario: 'Estudiante Ficticio Dos', fecha_prestamo: '2026-10-30', fecha_prevista: '2026-11-05', fecha_devolucion: null, created_at: ahora, updated_at: ahora },

    ]);
  },

  async down(queryInterface) {
    // Se borra en orden inverso por las llaves foráneas
    await queryInterface.bulkDelete('prestamos', null, {});
    await queryInterface.bulkDelete('equipos', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
  },
};