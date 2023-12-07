const transactionRepository = require('../repository/transaction');
const ServiceError = require('../core/serviceError');

const placeService = require('./place');
const handleDBError = require('./_handleDBError');

const getAll = async (userId) => {
  const items = await transactionRepository.findAll(userId);
  const count = await transactionRepository.findCount(userId);
  return {
    items,
    count,
  };
};

const getById = async (id, userId) => {
  const transaction = await transactionRepository.findById(id);

  if (!transaction || transaction.user.id !== userId) {
    throw ServiceError.notFound(`No transaction with id ${id} exists`, { id });
  }

  return transaction;
};

const create = async ({ amount, date, placeId, userId }) => {
  const existingPlace = await placeService.getById(placeId);

  if (!existingPlace) {
    throw ServiceError.notFound(`There is no place with id ${placeId}.`, { placeId });
  }

  try {
    const id = await transactionRepository.create({
      amount,
      date,
      userId,
      placeId,
    });
    return getById(id, userId);
  } catch (error) {
    throw handleDBError(error);
  }
};

const updateById = async (id, { amount, date, placeId, userId }) => {
  if (placeId) {
    const existingPlace = await placeService.getById(placeId);

    if (!existingPlace) {
      throw ServiceError.notFound(`There is no place with id ${id}.`, { id });
    }
  }

  try {
    await transactionRepository.updateById(id, {
      amount,
      date,
      userId,
      placeId,
    });
    return getById(id, userId);
  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id, userId) => {
  try {
    const deleted = await transactionRepository.deleteById(id, userId);

    if (!deleted) {
      throw ServiceError.notFound(`No transaction with id ${id} exists`, { id });
    }
  } catch (error) {
    throw handleDBError(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
