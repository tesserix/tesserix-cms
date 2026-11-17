import * as migration_20261117_020806_initial from './20261117_020806_initial';

export const migrations = [
  {
    up: migration_20261117_020806_initial.up,
    down: migration_20261117_020806_initial.down,
    name: '20261117_020806_initial'
  },
];
