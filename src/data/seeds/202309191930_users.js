const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.user).delete();

    // then add the fresh users (all passwords are 12345678)
    await knex(tables.user).insert([
      {
        id: 1,
        name: 'Thomas Aelbrecht',
      },
      {
        id: 2,
        name: 'Pieter Van Der Helst',
      },
      {
        id: 3,
        name: 'Karine Samyn',
      },
    ]);
  },
};
