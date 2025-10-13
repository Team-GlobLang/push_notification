import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  NATS_SERVERS: string;
}

const envsSchema = joi
  .object({
    NATS_SERVERS: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message} `);
}

const envVars: EnvVars = value;

export const envs = {
  nats_servers: envVars.NATS_SERVERS,
};
