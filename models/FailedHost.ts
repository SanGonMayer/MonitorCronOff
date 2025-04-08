// models/FailedHost.ts
import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@/lib/db';

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
    sequelize: getSequelize(), // Usa la instancia creada "a demanda"
    modelName: 'failed_host',
    tableName: 'hosts_fallidos',
    timestamps: false,
  }
);

export default FailedHost;
