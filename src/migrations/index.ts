import * as migration_20261117_020806_initial from './20261117_020806_initial';
import * as migration_20261117_045037_gcs_fields from './20261117_045037_gcs_fields';

export const migrations = [
  {
    up: migration_20261117_020806_initial.up,
    down: migration_20261117_020806_initial.down,
    name: '20261117_020806_initial',
  },
  {
    up: migration_20261117_045037_gcs_fields.up,
    down: migration_20261117_045037_gcs_fields.down,
    name: '20261117_045037_gcs_fields'
  },
];
