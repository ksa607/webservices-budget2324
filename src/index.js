const config = require('config');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { initializeLogger, getLogger } = require('./core/logging');
const installRest = require('./rest');

const NODE_ENV = config.get('env');
const LOG_LEVEL = config.get('log.level');
const LOG_DISABLED = config.get('log.disabled');

initializeLogger({
  level: LOG_LEVEL,
  disabled: LOG_DISABLED,
  defaultMeta: {
    NODE_ENV,
  },
});

const app = new Koa();

app.use(bodyParser());

installRest(app);

app.listen(9000, () => {
  getLogger().info('🚀 Server listening on http://localhost:9000');
});
