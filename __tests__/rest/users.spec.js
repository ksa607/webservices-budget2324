const supertest = require('supertest');
const createServer = require('../../src/createServer');
const { tables, getKnex } = require('../../src/data');

const data = {
  users: [{
    id: 1,
    name: 'User One',
  },
  {
    id: 2,
    name: 'User Two',
  },
  {
    id: 3,
    name: 'User Three',
  }]
};

const dataToDelete = {
  users: [1, 2, 3]
};

describe('Users', () => {

  let server;
  let request;
  let knex;

  beforeAll(async () => {
    server = await createServer();
    request = supertest(server.getApp().callback());
    knex = getKnex();
  });

  afterAll(async () => {
    await server.stop();
  });

  const url = '/api/users';

  describe('GET /api/users', () => {

    beforeAll(async () => {
      await knex(tables.user).insert(data.users);
    });

    afterAll(async () => {
      await knex(tables.user)
        .whereIn('id', dataToDelete.users)
        .delete();
    });

    it('should 200 and return all users', async () => {
      const response = await request.get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.count).toBe(3);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items).toEqual(expect.arrayContaining([{
        id: 1,
        name: 'User One',
      }, {
        id: 3,
        name: 'User Three',
      }]));
    });

    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });
  });

  describe('GET /api/user/:id', () => {

    beforeAll(async () => {
      await knex(tables.user).insert(data.users[0]);
    });

    afterAll(async () => {
      await knex(tables.user)
        .whereIn('id', dataToDelete.users)
        .delete();
    });

    it('should 200 and return the requested user', async () => {
      const response = await request.get(`${url}/1`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'User One',
      });
    });

    it('should 400 with invalid user id', async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });

  describe('POST /api/users/register', () => {

    const usersToDelete = [];

    afterAll(async () => {
      // Delete the update users
      await knex(tables.user)
        .whereIn('id', usersToDelete)
        .delete();
    });

    it('should 200 and return the updated user', async () => {
      const response = await request.post(`${url}/register`)
        .send({
          name: 'New user',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe('New user');

      usersToDelete.push(response.body.id);
    });

    it('should 400 when missing name', async () => {
      const response = await request.post(`${url}/register`)
        .send({
          email: 'register@hogent.be',
          password: '12345678',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });
  });

  describe('PUT /api/users/:id', () => {

    beforeAll(async () => {
      await knex(tables.user).insert(data.users[0]);
    });

    afterAll(async () => {
      // Delete the update users
      await knex(tables.user)
        .whereIn('id', dataToDelete.users)
        .delete();
    });

    it('should 200 and return the updated user', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          name: 'Changed name',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Changed name',
      });
    });

    it('should 400 when missing name', async () => {
      const response = await request.put(`${url}/5`)
        .send({
          email: 'update.user@hogent.be',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    it('should 404 with not existing user', async () => {
      const response = await request.delete(`${url}/123`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No user with id 123 exists',
        details: {
          id: 123,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });
  });

  describe('DELETE /api/users/:id', () => {

    beforeAll(async () => {
      await knex(tables.user).insert(data.users[0]);
    });

    it('should 204 and return nothing', async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should 400 with invalid user id', async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    it('should 404 with not existing user', async () => {
      const response = await request.delete(`${url}/123`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No user with id 123 exists',
        details: {
          id: 123,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });
  });
});
