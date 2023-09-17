const Koa = require('koa');
const winston = require('winston');
const bodyParser = require('koa-bodyparser');
const installRest = require('./rest');

const app = new Koa();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

app.use(bodyParser());

installRest(app);

app.listen(9000, () => {
  logger.info('🚀 Server listening on http://localhost:9000');
});
