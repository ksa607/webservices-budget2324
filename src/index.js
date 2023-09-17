const Koa = require('koa');
const winston = require('winston');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const transactionService = require('./service/transaction');

const app = new Koa();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

app.use(bodyParser());

const router = new Router();

router.get('/api/transactions', async (ctx) => {
  ctx.body = transactionService.getAll();
});

router.post('/api/transactions', async (ctx) => {
  const newTransaction = transactionService.create({
    ...ctx.request.body,
    placeId: Number(ctx.request.body.placeId),
    date: new Date(ctx.request.body.date),
  });
  ctx.body = newTransaction;
});

router.get('/api/transactions/:id', async (ctx) => {
  ctx.body = transactionService.getById(Number(ctx.params.id));
});

router.put('/api/transactions/:id', async (ctx) => {
  const updatedTransaction = transactionService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    placeId: Number(ctx.request.body.placeId),
    date: new Date(ctx.request.body.date),
  });
  ctx.body = updatedTransaction;
});

router.delete('/api/transactions/:id', async (ctx) => {
  ctx.body = transactionService.deleteById(Number(ctx.params.id));
});

app.use(router.routes())
   .use(router.allowedMethods());

app.listen(9000, () => {
  logger.info('🚀 Server listening on http://localhost:9000');
});
