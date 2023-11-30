# Broker CLI
Tool to quickly test RabbitMQ stuff without the need to create a full service.

As of now, the tool supports 4 environments:
- local
- staging
- uat
- prod

Duplicate the `.env.example` file, rename it to `.env` and replace the necessary values.

Then, simply execute the below command
```sh
npm run broker -- {env}

# eg
npm run broker -- local
```
