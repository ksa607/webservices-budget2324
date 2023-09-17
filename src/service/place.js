const { PLACES } = require('../data/mock_data');

const getAll = () => {
  return { items: PLACES, count: PLACES.length };
};

const getById = (id) => {
  return PLACES.find((t) => t.id === id);
};

const create = ({ name, rating }) => {
  const maxId = Math.max(...PLACES.map((i) => i.id));

  const newPlace = {
    id: maxId + 1,
    name,
    rating
  };
  PLACES.push(newPlace);
  return newPlace;
};

const updateById = (id, { name, rating }) => {
  const index = PLACES.findIndex((t) => t.id === id);
  const updatedPlace = {
    ...PLACES[index],
    name,
    rating
  };
  PLACES[index] = updatedPlace;
  return updatedPlace;
};

const deleteById = (id) => {
  const index = PLACES.findIndex((t) => t.id === id);
  PLACES.splice(index, 1);
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
