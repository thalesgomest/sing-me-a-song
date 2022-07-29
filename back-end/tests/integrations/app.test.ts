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
				name: faker.music.songName(),
				youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
			};

			const response = await supertest(app)
				.post('/recommendations')
				.send(body);

			expect(response.status).toBe(201);
		});

		it('Wrong data for create recommendation, should return status code 422', async () => {
			const body = {
				name: '',
				youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
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

		it('should remove recommendation if score is equal < -5', async () => {
			const data = await createRecommendation({ score: -5 });

			await supertest(app)
				.post(`/recommendations/${data.id}/downvote`)
				.send();

			const result = await loadRecommendation(data.id);
			expect(result).toBeNull();
		});
	});
});

describe('GET /recommendations', () => {
	it('should return 10 recommendations', async () => {
		await Promise.all(
			_.times(15, async () => {
				await createRecommendation();
			})
		);

		const response = await supertest(app).get('/recommendations').send();

		expect(response.status).toBe(200);
		expect(response.body.length).toBe(10);
	});
});
