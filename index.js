const Koa = require('koa');
const winston = require('winston');

const app = new Koa();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});

app.listen(9000, () => {
  logger.info('🚀 Server listening on http://localhost:9000');
});
