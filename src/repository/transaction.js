const { tables, getKnex } = require('../data/index');

const formatTransaction = ({
  place_id,
  place_name,
  user_id,
  user_name,
  ...transaction
}) => {
  return {
    ...transaction,
    user: {
      id: user_id,
      name: user_name,
    },
    place: {
      id: place_id,
      name: place_name,
    },
  };
};

const SELECT_COLUMNS = [
  `${tables.transaction}.id`,
  'amount',
  'date',
  `${tables.place}.id as place_id`,
  `${tables.place}.name as place_name`,
  `${tables.user}.id as user_id`,
  `${tables.user}.name as user_name`,
];

/**
 * Find a transaction with the given `id`.
 *
 * @param {number} id - Id of the transaction to find.
 */
const findById = async (id) => {
  const transaction = await getKnex()(tables.transaction)
    .join(
      tables.place,
      `${tables.transaction}.place_id`,
      '=',
      `${tables.place}.id`
    )
    .join(
      tables.user,
      `${tables.transaction}.user_id`,
      '=',
      `${tables.user}.id`
    )
    .where(`${tables.transaction}.id`, id)
    .first(SELECT_COLUMNS);

  return transaction && formatTransaction(transaction);
};

module.exports = {
  findById,
};
