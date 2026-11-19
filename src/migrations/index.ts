import * as migration_20261117_020806_initial from './20261117_020806_initial';
import * as migration_20261117_045037_gcs_fields from './20261117_045037_gcs_fields';
import * as migration_20261117_045448_updated_by from './20261117_045448_updated_by';
import * as migration_20261118_232913_tesserix_collections from './20261118_232913_tesserix_collections';

export const migrations = [
  {
    up: migration_20261117_020806_initial.up,
    down: migration_20261117_020806_initial.down,
    name: '20261117_020806_initial',
  },
  {
    up: migration_20261117_045037_gcs_fields.up,
    down: migration_20261117_045037_gcs_fields.down,
    name: '20261117_045037_gcs_fields',
  },
  {
    up: migration_20261117_045448_updated_by.up,
    down: migration_20261117_045448_updated_by.down,
    name: '20261117_045448_updated_by',
  },
  {
    up: migration_20261118_232913_tesserix_collections.up,
    down: migration_20261118_232913_tesserix_collections.down,
    name: '20261118_232913_tesserix_collections'
  },
];
