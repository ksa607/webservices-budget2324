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
  });
});
