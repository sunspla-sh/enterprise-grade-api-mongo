import dotenvExtended from 'dotenv-extended';
import dotenvParseVariables from 'dotenv-parse-variables';

const env = dotenvExtended.load({
  path: process.env.ENV_FILE,
  defaults: './config/.env.defaults',
  schema: './config/.env.schema',
  includeProcessEnv: true,
  silent: false,
  errorOnMissing: true,
  errorOnExtra: true
});

const parsedEnv = dotenvParseVariables(env);

//Define log levels type (silent + winston default npm)
type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'

interface Config {
  jwtHmacSecret: string,
  morganLogger: boolean,
  morganBodyLogger: boolean,
  exmplDevLogger: boolean,
  loggerLevel: LogLevel,
  mongo: {
    url: string,
    autoIndex: boolean
  },
  localCacheTtl: number
}

const config: Config = {
  jwtHmacSecret: parsedEnv.JWT_HMAC_SECRET as string,
  morganLogger: parsedEnv.MORGAN_LOGGER as boolean,
  morganBodyLogger: parsedEnv.MORGAN_BODY_LOGGER as boolean,
  exmplDevLogger: parsedEnv.EXMPL_DEV_LOGGER as boolean,
  loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,
  mongo: {
    url: parsedEnv.MONGO_URL as string,
    autoIndex: parsedEnv.MONGO_AUTO_INDEX as boolean
  },
  localCacheTtl: parsedEnv.LOCAL_CACHE_TTL as number
}

export default config;