const transactionRepository = require('../repository/transaction');
const placeService = require('./place');
const ServiceError = require('../core/serviceError');
const handleDBError = require('./_handleDBError');

const getAll = async () => {
  const items = await transactionRepository.findAll();
  return {
    items,
    count: items.length,
  };
};

const getById = async (id) => {
  const transaction = await transactionRepository.findById(id);

  if (!transaction) {
    throw ServiceError.notFound(`No transaction with id ${id} exists`, { id });
  }

  return transaction;
};

const create = async ({ amount, date, placeId, userId }) => {
  const existingPlace = await placeService.getById(placeId);

  if (!existingPlace) {
    throw ServiceError.notFound(`There is no place with id ${id}.`, { id });
  }

  try {
    const id = await transactionRepository.create({
      amount,
      date,
      userId,
      placeId,
    });
    return getById(id);
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
    return getById(id);
  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id) => {
  try {
    const deleted = await transactionRepository.deleteById(id);

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
