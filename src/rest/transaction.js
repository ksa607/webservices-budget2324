const Router = require('@koa/router');
const Joi = require('joi');
const validate = require('../core/validation');
const transactionService = require('../service/transaction');

const getAllTransactions = async (ctx) => {
  ctx.body = await transactionService.getAll();
};
getAllTransactions.validationScheme = null;

const createTransaction = async (ctx) => {
  const newTransaction = await transactionService.create({
    ...ctx.request.body,
    placeId: Number(ctx.request.body.placeId),
    date: new Date(ctx.request.body.date),
    userId: Number(ctx.request.body.userId),
  });
  ctx.status = 201;
  ctx.body = newTransaction;
};
createTransaction.validationScheme = {
  body: {
    amount: Joi.number().invalid(0),
    date: Joi.date().iso().less('now'),
    placeId: Joi.number().integer().positive(),
    userId: Joi.number().integer().positive(),
  },
};

const getTransactionById = async (ctx) => {
  ctx.body = await transactionService.getById(Number(ctx.params.id));
};
getTransactionById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const updateTransaction = async (ctx) => {
  ctx.body = await transactionService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    placeId: Number(ctx.request.body.placeId),
    date: new Date(ctx.request.body.date),
    userId: Number(ctx.request.body.userId),
  });
};

const deleteTransaction = async (ctx) => {
  await transactionService.deleteById(ctx.params.id);
  ctx.status = 204;
};

/**
 * Install transaction routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = (app) => {
  const router = new Router({
    prefix: '/transactions',
  });

  router.get(
    '/',
    validate(getAllTransactions.validationScheme),
    getAllTransactions
  );
  router.post(
    '/',
    validate(createTransaction.validationScheme),
    createTransaction
  );
  router.get(
    '/:id',
    validate(getTransactionById.validationScheme),
    getTransactionById
  );
  router.put('/:id', updateTransaction);
  router.delete('/:id', deleteTransaction);

  app.use(router.routes()).use(router.allowedMethods());
};
