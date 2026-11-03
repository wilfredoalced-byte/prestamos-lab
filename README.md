# prestamos-lab
API REST de préstamos de equipos de laboratorio - SENATI
# Préstamos Lab · API REST

API REST para controlar el préstamo de equipos de laboratorio. Registra equipos, préstamos y devoluciones, impide que un mismo equipo tenga dos préstamos activos y protege las operaciones con autenticación JWT.

**SENATI Huánuco · CFP Amarilis** · Curso: Fullstack Developer Software · Instructor: Ing. Darwin Uzuriaga Claudio

## Tecnologías

- Node.js y npm
- Express (servidor y rutas)
- MySQL 8 (ejecutado con Laragon)
- Sequelize ORM y sequelize-cli (modelos, migraciones y seeders)
- JSON Web Token (autenticación) y bcryptjs (hash de contraseñas)
- dotenv (variables de entorno) y cors
- Postman (pruebas)

## Requisitos

- Node.js 18 o superior
- MySQL 8 en ejecución (Laragon, XAMPP o MySQL Server)
- Git

## Instalación

```bash
git clone https://github.com/wilfredoalced-byte/prestamos-lab.git
cd prestamos-lab
npm install
```

## Configuración del archivo .env


Copiar la plantilla y completar los datos:

```bash
copy .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| PORT | Puerto del servidor | 3000 |
| DB_HOST | Servidor MySQL | 127.0.0.1 |
| DB_PORT | Puerto MySQL | 3306 |
| DB_USER | Usuario MySQL | root |
| DB_PASSWORD | Contraseña MySQL (vacía en Laragon) | |
| DB_NAME | Nombre de la base de datos | prestamos_lab |
| JWT_SECRET | Clave secreta para firmar los tokens | una frase larga |
| JWT_EXPIRES_IN | Duración del token | 2h |

> El archivo `.env` no se sube a GitHub. Solo se sube `.env.example`, sin secretos.

## Base de datos

Con MySQL encendido:

```bash
npx sequelize-cli db:create       # crea la base prestamos_lab
npx sequelize-cli db:migrate      # crea las tablas usuarios, equipos y prestamos
npx sequelize-cli db:seed:all     # carga datos de prueba ficticios
```

**Modelo de datos**

- `usuarios` (id, nombre, correo único, password_hash)

- `equipos` (id, código único, nombre, categoría, condición)
- `prestamos` (id, equipo_id, usuario_id, prestatario, fecha_prestamo, fecha_prevista, fecha_devolucion)

Relaciones: un usuario registra varios préstamos y un equipo conserva varios préstamos históricos. Un préstamo está **activo** cuando `fecha_devolucion` es NULL.

**Usuario de prueba:** `ana@ejemplo.com` / `Clave123`

## Ejecución

```bash
npm run dev     # desarrollo (se reinicia al guardar cambios)
npm start       # normal
```

El servidor queda en `http://localhost:3000`. Para comprobarlo: `GET /api/salud`.

## Rutas de la API

Las rutas de equipos y préstamos requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | Operación |
|---|---|---|
| POST | /api/auth/registro | Crear usuario |
| POST | /api/auth/login | Obtener token |
| GET / POST | /api/equipos | Listar o crear equipos |
| GET / PUT / DELETE | /api/equipos/:id | Consultar, actualizar o eliminar un equipo |
| GET / POST | /api/prestamos | Consultar o registrar préstamos |
| PUT | /api/prestamos/:id/devolucion | Registrar devolución |

**Filtros de consulta de préstamos**

| Parámetro | Ejemplo | Resultado |

|---|---|---|
| activos | `/api/prestamos?activos=true` | Solo préstamos sin devolución |
| equipo_id | `/api/prestamos?equipo_id=2` | Historial de un equipo |

Se pueden combinar: `/api/prestamos?activos=true&equipo_id=2`

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Operación correcta |
| 201 | Registro creado |
| 400 | Datos inválidos, incompletos o fechas incoherentes |
| 401 | Token ausente, inválido o expirado; credenciales incorrectas |
| 404 | Recurso inexistente |
| 409 | Conflicto: correo o código repetido, equipo ya prestado, equipo con historial |

## Reglas de negocio

- Las contraseñas se guardan con hash (bcrypt), nunca en texto plano.
- Un equipo no puede tener dos préstamos activos: se verifica dentro de una transacción que bloquea el equipo.
- Al registrar la devolución el equipo vuelve a estar disponible.
- No se puede eliminar un equipo que tiene historial de préstamos.
- El usuario autenticado queda registrado como responsable del préstamo.

## Estructura del proyecto

```
prestamos-lab/
├── config/          configuración de la base de datos
├── migrations/      creación de tablas
├── seeders/         datos de prueba ficticios

└── src/
    ├── controllers/ lógica de cada operación
    ├── middleware/  verificación del token JWT
    ├── models/      modelos Sequelize y relaciones
    ├── routes/      rutas de la API
    ├── utils/       funciones de validación
    ├── app.js       configuración de Express
    └── server.js    arranque del servidor
```

## Distribución de responsabilidades

| Integrante | Responsabilidades |
|---|---|
| Wilfredo Alcedo | Entorno y repositorio, base de datos MySQL, migraciones, seeders, modelos y relaciones, servidor Express, registro y login con JWT, middleware de autenticación, README |
| NOMBRE DEL COMPAÑERO | Validaciones, CRUD de equipos, préstamos y devoluciones, filtros de consulta, pruebas en Postman |

## Herramientas de apoyo

- Laragon para ejecutar MySQL y HeidiSQL para revisar las tablas.
- Postman para las pruebas de la API.
- Asistente de IA (Claude) como guía paso a paso durante el desarrollo.