import { RabbitMqConsumer } from './rabbitmq.helper'
import { EnvConfig, EnvironmentConfig, config } from './config'

const app = async (environment: EnvironmentConfig) => {
  const validEnvs = Object.keys(EnvConfig)

  if (!environment || !validEnvs.includes(environment)) {
    throw new Error(`You must provide a valid environment. Valid values: ${validEnvs.join(', ')}`)
  }

  const { rabbitmq } = config(environment)
  const consumer = new RabbitMqConsumer(rabbitmq.host, rabbitmq.demo.exchange)

  await consumer.init()
}
const environment = process.argv.slice(2)[0]

app(environment as EnvironmentConfig)
  .then(() => {
    console.log('Done')
    process.exit(0)
  })
  .catch((error) => {
    console.log('An error ocurred!')
    console.error(error)
    process.exit(1)
  })
