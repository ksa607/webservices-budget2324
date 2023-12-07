const { getLogger } = require('../core/logging');
const { tables, getKnex } = require('../data');

/**
 * Get all users.
 */
const findAll = () => {
  return getKnex()(tables.user).select().orderBy('name', 'ASC');
};

/**
 * Calculate the total number of user.
 */
const findCount = async () => {
  const [count] = await getKnex()(tables.user).count();
  return count['count(*)'];
};

/**
 * Find a user with the given id.
 *
 * @param {number} id - The id to search for.
 */
const findById = (id) => {
  return getKnex()(tables.user).where('id', id).first();
};

/**
 * Find a user with the given email.
 *
 * @param {string} email - The email to search for.
 */
const findByEmail = (email) => {
  return getKnex()(tables.user).where('email', email).first();
};

/**
 * Create a new user with the given `name`.
 *
 * @param {object} user - User to create.
 * @param {string} user.name - Name of the user.
 * @param {string} user.email - Email of the user.
 * @param {string} user.passwordHash - Hashed password of the user.
 * @param {string[]} roles - Roles of the user.
 */
const create = async ({
  name,
  email,
  passwordHash,
  roles,
}) => {
  try {
    const [id] = await getKnex()(tables.user).insert({
      name,
      email,
      password_hash: passwordHash,
      roles: JSON.stringify(roles),
    });
    return id;
  } catch (error) {
    getLogger().error('Error in create', {
      error,
    });
    throw error;
  }
};

/**
 * Update a user with the given `id`.
 *
 * @param {number} id - Id of the user to update.
 * @param {object} user - User to save.
 * @param {string} user.name - Name of the user.
 * @param {string} user.email - Email of the user.
 */
const updateById = async (id, { name, email }) => {
  try {
    await getKnex()(tables.user)
      .update({
        name,
        email,
      })
      .where('id', id);
    return id;
  } catch (error) {
    getLogger().error('Error in updateById', {
      error,
    });
    throw error;
  }
};

/**
 * Update a user with the given `id`.
 *
 * @param {number} id - Id of the user to delete.
 */
const deleteById = async (id) => {
  try {
    const rowsAffected = await getKnex()(tables.user).delete().where('id', id);
    return rowsAffected > 0;
  } catch (error) {
    getLogger().error('Error in deleteById', {
      error,
    });
    throw error;
  }
};

module.exports = {
  findAll,
  findCount,
  findById,
  findByEmail,
  create,
  updateById,
  deleteById,
};
