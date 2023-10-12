const userRepository = require('../repository/user');
const ServiceError = require('../core/serviceError');
const handleDBError = require('./_handleDBError');

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
    throw ServiceError.notFound(`No user with id ${id} exists`, { id });
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
  try {
    const userId = await userRepository.create({ name });
    return await userRepository.findById(userId);
  } catch (error) {
    throw handleDBError(error);
  }
};

/**
 * Update an existing user.
 *
 * @param {number} id - Id of the user to update.
 * @param {object} user - User to save.
 * @param {string} [user.name] - Name of the user.
 */
const updateById = async (id, { name }) => {
  try {
    await userRepository.updateById(id, { name });
    return getById(id);
  } catch (error) {
    throw handleDBError(error);
  }
};

/**
 * Delete an existing user.
 *
 * @param {number} id - Id of the user to delete.
 */
const deleteById = async (id) => {
  try {
    const deleted = await userRepository.deleteById(id);

    if (!deleted) {
      throw ServiceError.notFound(`No user with id ${id} exists`, { id });
    }
  } catch (error) {
    throw handleDBError(error);
  }
};

module.exports = {
  getAll,
  getById,
  register,
  updateById,
  deleteById,
};
