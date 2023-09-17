const Router = require('@koa/router');
const installTransactionRouter = require('./transaction');

/**
 * Install all routes in the given Koa application.
 *
 * @param {Koa} app - The Koa application.
 */
module.exports = (app) => {
  const router = new Router({
    prefix: '/api',
  });

  installTransactionRouter(router);

  app.use(router.routes())
     .use(router.allowedMethods());
};
