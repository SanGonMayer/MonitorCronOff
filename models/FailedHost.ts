// models/FailedHost.ts
import { DataTypes, Model } from 'sequelize';
import { db } from '../lib/db';


class FailedHost extends Model {}

FailedHost.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hostname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filial: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    times_submitted: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    last_failure: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: db,
    modelName: 'failed_host', // nombre interno del modelo
    tableName: 'hosts_fallidos', // nombre real de la tabla en Postgres
    timestamps: false,
  }
);

export default FailedHost;
