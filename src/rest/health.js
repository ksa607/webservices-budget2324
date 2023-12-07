const Router = require('@koa/router');

const healthService = require('../service/health');
const validate = require('../core/validation');

/**
 * @swagger
 * /api/health/ping:
 *   get:
 *     summary: Ping the server
 *     tags:
 *      - Health
 *     responses:
 *       200:
 *         description: Server pongs back
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - pong
 *               properties:
 *                 pong:
 *                   type: boolean
 */
const ping = async (ctx) => {
  ctx.status = 200;
  ctx.body = healthService.ping();
};
ping.validationScheme = null;

/**
 * @swagger
 * /api/health/version:
 *   get:
 *     summary: Get the server's version information
 *     tags:
 *      - Health
 *     responses:
 *       200:
 *         description: The server's running version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - env
 *                 - version
 *                 - name
 *               properties:
 *                 env:
 *                   type: string
 *                 version:
 *                   type: string
 *                 name:
 *                   type: string
 */
const getVersion = async (ctx) => {
  ctx.status = 200;
  ctx.body = healthService.getVersion();
};
getVersion.validationScheme = null;

/**
 * Install health routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installHealthRoutes(app) {
  const router = new Router({
    prefix: '/health',
  });

  router.get(
    '/ping',
    validate(ping.validationScheme),
    ping,
  );
  router.get(
    '/version',
    validate(getVersion.validationScheme),
    getVersion,
  );

  app.use(router.routes()).use(router.allowedMethods());
};
