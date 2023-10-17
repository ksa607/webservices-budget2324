const userRepository = require('../repository/user');
const ServiceError = require('../core/serviceError');
const { hashPassword, verifyPassword } = require('../core/password');
const { generateJWT } = require('../core/jwt');
const Role = require('../core/roles');
const handleDBError = require('./_handleDBError');

const makeExposedUser = ({ id, name, email, roles }) => ({
  id,
  name,
  email,
  roles,
});

const makeLoginData = async (user) => {
  const token = await generateJWT(user);
  return {
    user: makeExposedUser(user),
    token,
  };
};

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    // DO NOT expose we don't know the user
    throw ServiceError.unauthorized(
      'The given email and password do not match'
    );
  }

  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    // DO NOT expose we know the user but an invalid password was given
    throw ServiceError.unauthorized(
      'The given email and password do not match'
    );
  }

  return await makeLoginData(user);
};


/**
 * Get all users.
 */
const getAll = async () => {
  const items = await userRepository.findAll();
  return {
    items: items.map(makeExposedUser),
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

  return makeExposedUser(user);
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
      roles: [Role.USER],
    });
    const user = await userRepository.findById(userId);
    return await makeLoginData(user);
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
  login,
  getAll,
  getById,
  register,
  updateById,
  deleteById,
};
