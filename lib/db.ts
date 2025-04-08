// lib/db.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Declaración de variable para guardar la instancia; se inicializará de forma perezosa.
let sequelize: Sequelize | null = null;

// Función que retorna (y crea, si es necesario) la instancia de Sequelize.
export function getSequelize(): Sequelize {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DATABASE_NAME!,       // Nombre de la base de datos
      process.env.DATABASE_USER!,       // Usuario
      process.env.DATABASE_PASSWORD!,   // Contraseña
      {
        host: process.env.DATABASE_HOST, // Host
        port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432, // Puerto
        dialect: 'postgres',
        logging: false,
      }
    );
  }
  return sequelize;
}

// Función para sincronizar la base de datos (útil en /init)
export async function initDatabase() {
  return getSequelize().sync();
}
