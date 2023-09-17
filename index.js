const Koa = require('koa');
const winston = require('winston');
const bodyParser = require('koa-bodyparser');

const app = new Koa();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

app.use(bodyParser());

app.use(async (ctx, next) => {
  logger.info(JSON.stringify(ctx.request));
  logger.info(JSON.stringify(ctx.request.body));
  if (
    ctx.request.method === 'GET' &&
    ctx.request.url === '/api/transactions'
  ) {
    ctx.body =
      "[{'user': 'Benjamin', 'amount': 100, 'place': 'Irish Pub', date: '2021-08-15' }]";
  } else {
    ctx.body = 'Hello world';
  }
  return next();
});

app.listen(9000, () => {
  logger.info('🚀 Server listening on http://localhost:9000');
});
