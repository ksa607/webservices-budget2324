const Router = require('@koa/router');
const userService = require('../service/user');

const getAllUsers = async (ctx) => {
  const users = await userService.getAll();
  ctx.body = users;
};

const register = async (ctx) => {
  const user = await userService.register(ctx.request.body);
  ctx.status = 200;
  ctx.body = user;
};

const getUserById = async (ctx) => {
  const user = await userService.getById(ctx.params.id);
  ctx.status = 200;
  ctx.body = user;
};

const updateUserById = async (ctx) => {
  const user = await userService.updateById(ctx.params.id, ctx.request.body);
  ctx.status = 200;
  ctx.body = user;
};

const deleteUserById = async (ctx) => {
  await userService.deleteById(ctx.params.id);
  ctx.status = 204;
};

/**
 * Install user routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installUserRoutes(app) {
  const router = new Router({
    prefix: '/users',
  });

  router.get('/', getAllUsers);
  router.get('/:id', getUserById);
  router.post('/register', register);
  router.put('/:id', updateUserById);
  router.delete('/:id', deleteUserById);

  app.use(router.routes()).use(router.allowedMethods());
};
