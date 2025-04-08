// lib/db.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME!,     // Nombre de la base de datos
  process.env.DATABASE_USER!,     // Usuario
  process.env.DATABASE_PASSWORD!, // Contraseña
  {
    host: process.env.DATABASE_HOST,   // Host
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432, // Puerto
    dialect: 'postgres',
    logging: false,             
  }
);


async function initDatabase() {

  return sequelize.sync();
}


export { sequelize as db, initDatabase };
