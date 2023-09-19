const { tables, getKnex } = require('../data/index');

/**
 * Find all places.
 */
const findAll = () => {
  return getKnex()(tables.place).select().orderBy('name', 'ASC');
};

module.exports = {
  findAll,
};
