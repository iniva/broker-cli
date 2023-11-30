type Config = {
  rabbitmq: {
    host: string
    demo: {
      exchange: string
    }
  }
}

export enum EnvConfig {
  local = 'LOCAL',
  staging = 'STAGING',
  uat = 'UAT',
  prod = 'PROD',
}

export type EnvironmentConfig = keyof typeof EnvConfig

const getEnvVar = (env: EnvironmentConfig, varName: string): string => {
  const environment = EnvConfig[env]

  return process.env[`${environment}_${varName}`] || ''
}

export const config = (env: EnvironmentConfig): Config => {
  return {
    rabbitmq: {
      host: getEnvVar(env, 'RABBITMQ_HOST'),
      demo: {
        exchange: getEnvVar(env, 'EXCHANGE_NAME'),
      },
    },
  }
}
