import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  geminiApiKey: string;
  geminiModel: string;
  corsOrigin: string;
}

const INSECURE_JWT_SECRET = 'default-secret-change-me';
const jwtSecret = process.env.JWT_SECRET || INSECURE_JWT_SECRET;
const nodeEnv = process.env.NODE_ENV || 'development';

// Refuse to run in production with the insecure fallback secret: every token
// would be forgeable by anyone who has read this source file.
if (nodeEnv === 'production' && jwtSecret === INSECURE_JWT_SECRET) {
  throw new Error(
    'JWT_SECRET must be set to a strong, unique value in production. Refusing to start.'
  );
}
if (jwtSecret === INSECURE_JWT_SECRET) {
  console.warn(
    '[security] JWT_SECRET is not set; using an insecure development default. Set JWT_SECRET before deploying.'
  );
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

export default config;
