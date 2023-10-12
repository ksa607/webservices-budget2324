const supertest = require('supertest');
const createServer = require('../../src/createServer');
const { tables, getKnex } = require('../../src/data');

const data = {
  transactions: [{
    id: 1,
    user_id: 1,
    place_id: 1,
    amount: 3500,
    date: new Date(2021, 4, 25, 19, 40),
  },
  {
    id: 2,
    user_id: 1,
    place_id: 1,
    amount: -220,
    date: new Date(2021, 4, 8, 20, 0),
  },
  {
    id: 3,
    user_id: 1,
    place_id: 1,
    amount: -74,
    date: new Date(2021, 4, 21, 14, 30),
  }],
  places: [{
    id: 1,
    name: 'Test place',
    rating: 3,
  }],
  users: [{
    id: 1,
    name: 'Test User'
  }]
};

const dataToDelete = {
  transactions: [1, 2, 3],
  places: [1],
  users: [1]
};

describe('Transactions', () => {
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

  const url = '/api/transactions';

  describe('GET /api/transactions', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.user).insert(data.users);
      await knex(tables.transaction).insert(data.transactions);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', dataToDelete.transactions)
        .delete();

      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();

        await knex(tables.user)
        .whereIn('id', dataToDelete.users)
        .delete();
    });

    it('should 200 and return all transactions', async () => {
      const response = await request.get(url);
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items[1]).toEqual({
        id: 3,
        user: {
          id: 1,
          name: 'Test User',
        },
        place: {
          id: 1,
          name: 'Test place',
        },
        amount: -74,
        date: new Date(2021, 4, 21, 14, 30).toJSON(),
      });
      expect(response.body.items[2]).toEqual({
        id: 1,
        user: {
          id: 1,
          name: 'Test User',
        },
        place: {
          id: 1,
          name: 'Test place',
        },
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40).toJSON(),
      });
    });
  });

  describe('GET /api/transactions/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.user).insert(data.users);
      await knex(tables.transaction).insert(data.transactions[0]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', dataToDelete.transactions)
        .delete();

      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();

      await knex(tables.user)
        .whereIn('id', dataToDelete.users)
        .delete();
    });

    test('it should 200 and return the requested transaction', async () => {
      const response = await request.get(`${url}/1`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        user: {
          id: 1,
          name: 'Test User',
        },
        place: {
          id: 1,
          name: 'Test place',
        },
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40).toJSON(),
      });
    });
  });

  describe('POST /api/transactions', () => {
    const transactionsToDelete = [];

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.user).insert(data.users);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', transactionsToDelete)
        .delete();

      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();

      await knex(tables.user)
        .whereIn('id', dataToDelete.users)
        .delete();
    });

    it('should 201 and return the created transaction', async () => {
      const response = await request.post(url)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 1,
          userId: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.amount).toBe(102);
      expect(response.body.date).toBe('2021-05-27T13:00:00.000Z');
      expect(response.body.place).toEqual({
        id: 1,
        name: 'Test place',
      });
      expect(response.body.user).toEqual({
        id: 1,
        name: 'Test User'
      });

      transactionsToDelete.push(response.body.id);
    });
  });

  describe('PUT /api/transactions/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.user).insert(data.users);
      await knex(tables.transaction).insert(data.transactions[0]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', dataToDelete.transactions)
        .delete();

      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();

      await knex(tables.user)
        .whereIn('id', dataToDelete.users)
        .delete();
    });

    it('should 200 and return the updated transaction', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 1,
          userId: 1,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBeTruthy();
      expect(response.body.amount).toBe(-125);
      expect(response.body.date).toBe('2021-05-27T13:00:00.000Z');
      expect(response.body.place).toEqual({
        id: 1,
        name: 'Test place',
      });
      expect(response.body.user).toEqual({
        id: 1,
        name: 'Test User',
      });
    });
  });

  describe('DELETE /api/transactions/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.user).insert(data.users);
      await knex(tables.transaction).insert(data.transactions[0]);
    });

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();

      await knex(tables.user)
        .whereIn('id', dataToDelete.users)
        .delete();
    });

    it('should 204 and return nothing', async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });
  });
});
