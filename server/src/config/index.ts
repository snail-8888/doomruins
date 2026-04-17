import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  database: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/doomruins',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  game: {
    name: '末日废墟',
    maxHeroesPerTeam: 6,
    maxBattleTurns: 30,
  },
};

export default config;
