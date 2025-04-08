import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configura la conexión con los valores del .env
const sequelize = new Sequelize(
  process.env.DB_NAME!,     // Nombre de la base de datos
  process.env.DB_USER!,     // Usuario
  process.env.DB_PASSWORD!, // Contraseña
  {
    host: process.env.DB_HOST,   // Host
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432, // Puerto (opcional)
    dialect: 'postgres',
    logging: false,              // Deshabilita el logging SQL
  }
);

export default sequelize;