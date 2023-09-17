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
  const index = TRANSACTIONS.findIndex((t) => t.id === id);
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
  const updatedTransaction = {
    ...TRANSACTIONS[index],
    amount,
    date: date.toISOString(),
    place: existingPlace,
    user,
  };
  TRANSACTIONS[index] = updatedTransaction;
  return updatedTransaction;
};

const deleteById = (id) => {
  const index = TRANSACTIONS.findIndex((t) => t.id === id);
  TRANSACTIONS.splice(index, 1);
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
