const supertest = require('supertest');
const createServer = require('../../src/createServer');
const { tables, getKnex } = require('../../src/data');

const data = {
  places: [
    { id: 1, name: 'Loon', rating: 5 },
    { id: 2, name: 'Benzine', rating: 2 },
    { id: 3, name: 'Irish pub', rating: 4 },
  ]
};

const dataToDelete = {
  places: [1, 2, 3],
};

describe('Places', () => {
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

  const url = '/api/places';

  describe('GET /api/places', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
    });

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();
    });

    it('should 200 and return all places', async () => {
      const response = await request.get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items).toEqual(expect.arrayContaining([{
        id: 2,
        name: 'Benzine',
        rating: 2,
      }, {
        id: 3,
        name: 'Irish pub',
        rating: 4,
      }]));
    });

    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });
  });

  describe('GET /api/places/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places[0]);
    });

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();
    });

    it('should 200 and return the requested place', async () => {
      const response = await request.get(`${url}/1`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Loon',
        rating: 5,
      });
    });

    it('should 404 when requesting not existing place', async () => {
      const response = await request.get(`${url}/2`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No place with id 2 exists',
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid place id', async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });

  describe('POST /api/places', () => {

    const placesToDelete = [];

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', placesToDelete)
        .delete();
    });

    it('should 201 and return the created place', async () => {
      const response = await request.post(url)
        .send({
          name: 'New place',
          rating: 2,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe('New place');
      expect(response.body.rating).toBe(2);

      placesToDelete.push(response.body.id);
    });

    it('should 400 when missing name', async () => {
      const response = await request.post(url)
        .send({
          rating: 3,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    it('should 400 when rating lower than one', async () => {
      const response = await request.post(url)
        .send({
          name: 'The wrong place',
          rating: 0,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating higher than five', async () => {
      const response = await request.post(url)
        .send({
          name: 'The wrong place',
          rating: 6,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating is a decimal', async () => {
      const response = await request.post(url)
        .send({
          name: 'The wrong place',
          rating: 3.5,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });
  });

  describe('PUT /api/places/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places);
    });

    afterAll(async () => {
      await knex(tables.place)
        .whereIn('id', dataToDelete.places)
        .delete();
    });

    it('should 200 and return the updated place', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          name: 'Changed name',
          rating: 1,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Changed name',
        rating: 1,
      });
    });

     it('should 400 for duplicate place name', async () => {
      const response = await request.put(`${url}/2`)
        .send({
          name: 'Changed name',
          rating: 1,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: 'A place with this name already exists',
        details: {},
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing name', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          rating: 3,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    it('should 400 when missing rating', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          name: 'The name',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating lower than one', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          name: 'The wrong place',
          rating: 0,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating higher than five', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          name: 'The wrong place',
          rating: 6,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });

    it('should 400 when rating is a decimal', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          name: 'The wrong place',
          rating: 3.5,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('rating');
    });
  });

  describe('DELETE /api/places/:id', () => {

    beforeAll(async () => {
      await knex(tables.place).insert(data.places[0]);
    });

    it('should 204 and return nothing', async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should 404 with not existing place', async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No place with id 1 exists',
        details: {
          id: 1,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid place id', async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });
});
