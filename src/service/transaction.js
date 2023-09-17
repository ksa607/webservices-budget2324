const { TRANSACTIONS, PLACES } = require('../data/mock_data');

const getAll = () => {
  return { items: TRANSACTIONS, count: TRANSACTIONS.length };
};

const getById = (id) => {
  return TRANSACTIONS.find((t) => t.id === id);
};

const create = ({ amount, date, placeId, user }) => {
  let existingPlace;
  if (placeId) {
    existingPlace = PLACES.find((place) => place.id === placeId);

    if (!existingPlace) {
      throw new Error(`There is no place with id ${placeId}.`);
    }
  }

  if (typeof user === 'string') {
    user = { id: Math.floor(Math.random() * 100000), name: user };
  }
  const maxId = Math.max(...TRANSACTIONS.map((i) => i.id));

  const newTransaction = {
    id: maxId + 1,
    amount,
    date: date.toISOString(),
    place: existingPlace,
    user,
  };
  TRANSACTIONS.push(newTransaction);
  return newTransaction;
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
