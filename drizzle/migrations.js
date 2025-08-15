// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_heavy_warstar.sql';
import m0001 from './0001_far_mentallo.sql';
import m0002 from './0002_sad_roland_deschain.sql';
import m0003 from './0003_chunky_warbound.sql';
import m0004 from './0004_smart_barracuda.sql';
import m0005 from './0005_smiling_carmella_unuscione.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005
    }
  }
  