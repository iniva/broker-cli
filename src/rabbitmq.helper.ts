import { Channel, Connection, connect } from 'amqplib'

class RabbitMqClient {
  private _connection: null | Connection = null
  private _channel: null | Channel = null

  constructor(
    private _host: string,
    private _exchange: string,
  ) {}

  async init(timeoutMs: number = 2000): Promise<void> {
    this._connection = await connect(this._host, { timeout: timeoutMs })
    this._channel = await this._connection.createChannel()
    await this._channel.assertExchange(this._exchange, 'topic', {
      durable: true,
    })
  }

  async close(): Promise<void> {
    if (!this._channel || !this._connection) {
      return
    }

    await this._channel.close()
    await this._connection.close()
  }

  get channel(): Channel | null {
    return this._channel
  }

  get exchange(): string {
    return this._exchange
  }
}

export class RabbitMqProducer {
  private _client: RabbitMqClient

  constructor(host: string, exchange: string) {
    this._client = new RabbitMqClient(host, exchange)
  }

  async init(): Promise<void> {
    await this._client.init()
  }

  async close(): Promise<void> {
    return this._client.close()
  }

  publish(routingKey: string, message: any): void {
    if (!this._client.channel) {
      throw new Error(
        `Client hasn't been initialised. Did you forget to run "await instance.init()"?`,
      )
    }

    this._client.channel.publish(
      this._client.exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
    )
  }
}

export class RabbitMqConsumer {
  private _client: RabbitMqClient
  private _queue: string = ''

  constructor(host: string, exchange: string) {
    this._client = new RabbitMqClient(host, exchange)
  }

  async init(): Promise<void> {
    await this._client.init()

    const { queue } = await (this._client.channel as Channel).assertQueue('', {
      exclusive: true,
    })

    this._queue = queue
  }

  async close(): Promise<void> {
    return this._client.close()
  }

  async bindQueue(routeKeys: string | string[] = ['*']): Promise<void> {
    if (!this._client.channel) {
      throw new Error(
        `Client hasn't been initialised. Did you forget to run "await instance.init()"?`,
      )
    }

    const routes = !Array.isArray(routeKeys) ? [routeKeys] : routeKeys

    for (const routeKey of routes) {
      await this._client.channel.bindQueue(this._queue, this._client.exchange, routeKey)
    }
  }

  async consume(): Promise<any> {
    if (!this._client.channel) {
      throw new Error(
        `Client hasn't been initialised. Did you forget to run "await instance.init()"?`,
      )
    }

    const channel = this._client.channel

    return new Promise((resolve, reject) =>
      channel.consume(this.queue, (data) => {
        if (data) {
          const parsedMessage = JSON.parse(data.content.toString())

          resolve(parsedMessage)
        } else {
          reject(' [x] Consumer canceled')
        }
      }),
    )
  }

  get queue(): string {
    return this._queue
  }

  get channel(): Channel | null {
    return this._client.channel
  }
}
