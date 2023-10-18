const { tables } = require('../../src/data');
const { withServer, login } = require('../supertest.setup');
const { testAuthHeader } = require('../common/auth');

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
};

const dataToDelete = {
  transactions: [1, 2, 3],
  places: [1],
};

describe('Transactions', () => {
  let request, knex, authHeader;

  withServer(({
    supertest,
    knex: k,
  }) => {
    request = supertest;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await login(request);
  });

  const url = '/api/transactions';

  describe('GET /api/transactions', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.transaction).insert(data.transactions);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', dataToDelete.transactions)
        .delete();

      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();
    });

    it('should 200 and return all transactions', async () => {
      const response = await request.get(url)
        .set('Authorization', authHeader);

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

    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });

    testAuthHeader(() => request.get(url));
  });

  describe('GET /api/transactions/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.transaction).insert(data.transactions[0]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', dataToDelete.transactions)
        .delete();

      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();
    });

    it('should 200 and return the requested transaction', async () => {
      const response = await request.get(`${url}/1`)
        .set('Authorization', authHeader);

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

    it('should 404 when requesting not existing transaction', async () => {
      const response = await request.get(`${url}/2`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No transaction with id 2 exists',
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid transaction id', async () => {
      const response = await request.get(`${url}/invalid`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.get(`${url}/1`));
  });

  describe('POST /api/transactions', () => {
    const transactionsToDelete = [];

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', transactionsToDelete)
        .delete();

      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();
    });

    it('should 201 and return the created transaction', async () => {
      const response = await request.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 1,
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

    it('should 404 when place does not exist', async () => {
      const response = await request.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 123,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No place with id 123 exists',
        details: {
          id: 123,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing amount', async () => {
      const response = await request.post(url)
        .set('Authorization', authHeader)
        .send({
          date: '2021-05-27T13:00:00.000Z',
          placeId: 4,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('amount');
    });

    it('should 400 when missing date', async () => {
      const response = await request.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          placeId: 4,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('date');
    });

    it('should 400 when missing placeId', async () => {
      const response = await request.post(url)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('placeId');
    });

    testAuthHeader(() => request.post(url));
  });

  describe('PUT /api/transactions/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.transaction).insert(data.transactions[0]);
    });

    afterAll(async () => {
      await knex(tables.transaction)
        .whereIn('id', dataToDelete.transactions)
        .delete();

      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();
    });

    it('should 200 and return the updated transaction', async () => {
      const response = await request.put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 1,
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

    it('should 404 when updating not existing transaction', async () => {
      const response = await request.put(`${url}/2`)
        .set('Authorization', authHeader)
        .send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 1,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No transaction with id 2 exists',
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 404 when place does not exist', async () => {
      const response = await request.put(`${url}/1`)
        .set('Authorization', authHeader)
        .send({
          amount: -125,
          date: '2021-05-27T13:00:00.000Z',
          placeId: 123,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No place with id 123 exists',
        details: {
          id: 123,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing amount', async () => {
      const response = await request.put(`${url}/4`)
        .set('Authorization', authHeader)
        .send({
          date: '2021-05-27T13:00:00.000Z',
          placeId: 4,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('amount');
    });

    it('should 400 when missing date', async () => {
      const response = await request.put(`${url}/4`)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          placeId: 4,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('date');
    });

    it('should 400 when missing placeId', async () => {
      const response = await request.put(`${url}/4`)
        .set('Authorization', authHeader)
        .send({
          amount: 102,
          date: '2021-05-27T13:00:00.000Z',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('placeId');
    });

    testAuthHeader(() => request.put(`${url}/1`));
  });

  describe('DELETE /api/transactions/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
      await knex(tables.transaction).insert(data.transactions[0]);
    });

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();
    });

    it('should 204 and return nothing', async () => {
      const response = await request.delete(`${url}/1`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should 404 with not existing place', async () => {
      const response = await request.delete(`${url}/4`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No transaction with id 4 exists',
        details: {
          id: 4,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid transaction id', async () => {
      const response = await request.delete(`${url}/invalid`)
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.delete(`${url}/1`));
  });
});
