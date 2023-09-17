const { TRANSACTIONS, PLACES } = require('../data/mock_data');

const getAll = () => {
  return { items: TRANSACTIONS, count: TRANSACTIONS.length };
};

const getById = (id) => {
  throw new Error('Not implemented yet!');
};

const create = ({ amount, date, placeId, user }) => {
  throw new Error('Not implemented yet!');
};
const updateById = (id, { amount, date, placeId, user }) => {
  throw new Error('Not implemented yet!');
};

const deleteById = (id) => {
  throw new Error('Not implemented yet!');
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
