const Router = require('@koa/router');
const Joi = require('joi');
const userService = require('../service/user');
const validate = require('../core/validation');

const getAllUsers = async (ctx) => {
  const users = await userService.getAll();
  ctx.body = users;
};
getAllUsers.validationScheme = null;

const register = async (ctx) => {
  const user = await userService.register(ctx.request.body);
  ctx.status = 200;
  ctx.body = user;
};
register.validationScheme = {
  body: {
    name: Joi.string().max(255),
    email: Joi.string().email(),
    password: Joi.string().min(8).max(30),
  },
};

const getUserById = async (ctx) => {
  const user = await userService.getById(ctx.params.id);
  ctx.status = 200;
  ctx.body = user;
};
getUserById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

const updateUserById = async (ctx) => {
  const user = await userService.updateById(ctx.params.id, ctx.request.body);
  ctx.status = 200;
  ctx.body = user;
};
updateUserById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: {
    name: Joi.string().max(255),
  },
};

const deleteUserById = async (ctx) => {
  await userService.deleteById(ctx.params.id);
  ctx.status = 204;
};
deleteUserById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
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

  router.get(
    '/',
    validate(getAllUsers.validationScheme),
    getAllUsers
  );
  router.get(
    '/:id',
    validate(getUserById.validationScheme),
    getUserById
  );
  router.post(
    '/register',
    validate(register.validationScheme),
    register
  );
  router.put(
    '/:id',
    validate(updateUserById.validationScheme),
    updateUserById
  );
  router.delete(
    '/:id',
    validate(deleteUserById.validationScheme),
    deleteUserById
  );

  app.use(router.routes()).use(router.allowedMethods());
};
