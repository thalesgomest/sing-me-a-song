import { faker } from '@faker-js/faker';
import _ from 'lodash';
import supertest from 'supertest';
import app from '../../src/app.js';
import {
	createRecommendation,
	loadRecommendation,
} from '../factories/recommendationsFactory.js';
import cleanDatabase from '../helpers/cleanDatabase.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('Integration Tests', () => {
	describe('POST /recommendations', () => {
		it('should create a new recommendation, return status code equal 201', async () => {
			const body = {
				name: faker.lorem.words(2),
				youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
			};

			const response = await supertest(app)
				.post('/recommendations')
				.send(body);

			expect(response.status).toBe(201);
		});

		it('Wrong data for create recommendation, should return status code 422', async () => {
			const body = {
				name: faker.lorem.words(2),
				youtubeLink: `https://www.google.com/${faker.datatype.uuid()}`,
			};

			const response = await supertest(app)
				.post('/recommendations')
				.send(body);

			expect(response.status).toBe(422);
		});

		it('Recommendation already created, should return status code 409', async () => {
			const data = await createRecommendation();

			const result = await loadRecommendation(data.id);

			const body = {
				name: result.name,
				youtubeLink: result.youtubeLink,
			};

			const response = await supertest(app)
				.post('/recommendations')
				.send(body);

			expect(response.status).toBe(409);
		});
	});

	describe('POST /recommendations/:id/upvote', () => {
		it('should return sucess when exist a recommendation, return status code equal 200', async () => {
			const data = await createRecommendation();

			const response = await supertest(app)
				.post(`/recommendations/${data.id}/upvote`)
				.send();

			expect(response.status).toBe(200);
		});

		it('should return status code 404 when a recommendation is not found', async () => {
			const id = faker.datatype.number({ max: 0 });

			const response = await supertest(app)
				.post(`/recommendations/${id}/upvote`)
				.send();
			expect(response.status).toBe(404);
		});

		it('should return score equal +1 when the recommendation exists', async () => {
			const data = await createRecommendation();

			await supertest(app)
				.post(`/recommendations/${data.id}/upvote`)
				.send();

			const result = await loadRecommendation(data.id);
			expect(result.score - data.score).toEqual(1);
		});
	});

	describe('POST /recommendations/:id/downvote', () => {
		it('should return sucess when exist a recommendation, return status code equal 200', async () => {
			const data = await createRecommendation();

			const response = await supertest(app)
				.post(`/recommendations/${data.id}/downvote`)
				.send();

			expect(response.status).toBe(200);
		});

		it('should return status code 404 when a recommendation is not found', async () => {
			const id = faker.datatype.number({ max: 0 });

			const response = await supertest(app)
				.post(`/recommendations/${id}/downvote`)
				.send();
			expect(response.status).toBe(404);
		});

		it('should return score equal -1 when the recommendation exists', async () => {
			const data = await createRecommendation();

			await supertest(app)
				.post(`/recommendations/${data.id}/downvote`)
				.send();

			const result = await loadRecommendation(data.id);
			expect(result.score - data.score).toEqual(-1);
		});

		it('should delete recommendation if score is equal < -5', async () => {
			const data = await createRecommendation({ score: -5 });

			await supertest(app)
				.post(`/recommendations/${data.id}/downvote`)
				.send();

			const result = await loadRecommendation(data.id);
			expect(result).toBeNull();
		});
	});

	describe('GET /recommendations', () => {
		it('should return 10 recommendations', async () => {
			await Promise.all(
				_.times(15, async () => {
					await createRecommendation();
				})
			);

			const response = await supertest(app)
				.get('/recommendations')
				.send();

			expect(response.status).toBe(200);
			expect(response.body.length).toBe(10);
		});

		it('should return the last 10 recommendations', async () => {
			const recommendations = await Promise.all(
				_.times(15, async () => {
					return await createRecommendation();
				})
			);

			const recommendationsOrderedById = _.orderBy(
				recommendations,
				['id'],
				['desc']
			);
			const last10Recommendations = _.take(
				recommendationsOrderedById,
				10
			);
			const response = await supertest(app)
				.get('/recommendations')
				.send();

			expect(response.status).toBe(200);
			expect(response.body).toEqual(last10Recommendations);
		});
	});

	describe('GET /recommendations/:id', () => {
		it('should return a recommendations search by correct id', async () => {
			const recommendation = await createRecommendation();

			const response = await supertest(app)
				.get(`/recommendations/${recommendation.id}`)
				.send();

			expect(response.status).toBe(200);
			expect(response.body).toMatchObject(recommendation);
		});

		it('should not return a recommendations search by incorrect id', async () => {
			const id = faker.datatype.number({ max: 0 });

			const response = await supertest(app)
				.get(`/recommendations/${id}`)
				.send();

			expect(response.body).toEqual({});
		});
	});

	describe('GET /recommendations/random', () => {
		it('should return a random recommendation', async () => {
			await createRecommendation({
				score: faker.datatype.number({ min: 10 }),
			});

			const response = await supertest(app)
				.get('/recommendations/random')
				.send();

			expect(response.status).toBe(200);
		});

		it('should not return a random recommendation', async () => {
			const response = await supertest(app)
				.get('/recommendations/random')
				.send();

			expect(response.status).toBe(404);
		});
	});

	describe('GET /recommendations/top/:amount', () => {
		it('should return 10 recommendations ordered desc by score', async () => {
			const recommendations = await Promise.all(
				_.times(15, async () => {
					return await createRecommendation({
						score: faker.datatype.number({ min: 15 }),
					});
				})
			);

			const recommendationsOrderedByScore = _.orderBy(
				recommendations,
				['score'],
				['desc']
			);
			const top10RecommendationsOrderedByScore = _.take(
				recommendationsOrderedByScore,
				10
			);
			const response = await supertest(app)
				.get('/recommendations/top/10')
				.send();
			expect(response.body).toEqual(top10RecommendationsOrderedByScore);
		});

		it('should not return a recommendation if does not exist recommendations registred', async () => {
			const response = await supertest(app)
				.get('/recommendations/top/10')
				.send();

			expect(response.body).toEqual([]);
		});
	});
});
