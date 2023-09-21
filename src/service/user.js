const userRepository = require('../repository/user');

/**
 * Get all users.
 */
const getAll = async () => {
  const items = await userRepository.findAll();
  return {
    items,
    count: items.length,
  };
};

/**
 * Get the user with the given id.
 *
 * @param {number} id - Id of the user to get.
 */
const getById = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw Error(`No user with id ${id} exists`, { id });
  }

  return user;
};

/**
 * Register a user.
 *
 * @param {object} user - User to save.
 * @param {string} [user.name] - Name of the user.
 */
const register = async ({ name }) => {
  const userId = await userRepository.create({ name });

  const user = await userRepository.findById(userId);

  return user;
};

/**
 * Update an existing user.
 *
 * @param {number} id - Id of the user to update.
 * @param {object} user - User to save.
 * @param {string} [user.name] - Name of the user.
 */
const updateById = async (id, { name }) => {
  await userRepository.updateById(id, { name });
  return getById(id);
};

/**
 * Delete an existing user.
 *
 * @param {number} id - Id of the user to delete.
 */
const deleteById = async (id) => {
  const deleted = await userRepository.deleteById(id);

  if (!deleted) {
    throw Error(`No user with id ${id} exists`, { id });
  }
};

module.exports = {
  getAll,
  getById,
  register,
  updateById,
  deleteById,
};
