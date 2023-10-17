const userRepository = require('../repository/user');
const ServiceError = require('../core/serviceError');
const { hashPassword } = require('../core/password');
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
 * @param {string} [user.email] - Email of the user.
 * @param {string} [user.password] - Password of the user.
 */
const register = async ({
  name,
  email,
  password,
}) => {
  try {
    const passwordHash = await hashPassword(password);

    const userId = await userRepository.create({
      name,
      email,
      passwordHash,
      roles: ['user'],
    });
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
 * @param {string} [user.email] - Email of the user.
 */
const updateById = async (id, { name, email }) => {
  try {
    await userRepository.updateById(id, {
      name,
      email,
    });
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
