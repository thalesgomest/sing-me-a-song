import { faker } from '@faker-js/faker';
import recommendationRepository from '../../src/repositories/recommendationRepository.js';
import { recommendationService } from '../../src/services/recommendationsService.js';
import _ from 'lodash';
import { jest } from '@jest/globals';
import {
	createRecommendationData,
	createRecommendation,
} from '../factories/recommendationsFactory.js';
import cleanDatabase from '../helpers/cleanDatabase.js';

beforeEach(async () => {
	await cleanDatabase();
	jest.resetAllMocks();
});

describe('Unitary tests', () => {
	describe('insert', () => {
		it('should call function create recommendation with correct createDataRecommentadion', async () => {
			const recommendation = createRecommendationData();
			const spy = jest
				.spyOn(recommendationRepository, 'create')
				.mockImplementationOnce((): any => {});
			jest.spyOn(
				recommendationRepository,
				'findByName'
			).mockImplementationOnce((): any => {});

			await recommendationService.insert(recommendation);
			expect(spy).toBeCalledWith(recommendation);
		});

		it('should call function findByName with correct createDataRecommentadion', async () => {
			const recommendation = createRecommendationData();
			const spy = jest
				.spyOn(recommendationRepository, 'findByName')
				.mockResolvedValue(undefined);
			jest.spyOn(
				recommendationRepository,
				'create'
			).mockImplementationOnce((): any => {});
			await recommendationService.insert(recommendation);
			expect(spy).toBeCalledWith(recommendation.name);
		});

		it('should throw error when have a conflict name', async () => {
			const recommendation = await createRecommendation();
			jest.spyOn(
				recommendationRepository,
				'findByName'
			).mockResolvedValueOnce(recommendation);
			jest.spyOn(
				recommendationRepository,
				'create'
			).mockImplementationOnce((): any => {});
			const result = recommendationService.insert(recommendation);
			expect(result).rejects.toEqual({
				type: 'conflict',
				message: 'Recommendations names must be unique',
			});
		});
	});

	describe('upvote', () => {
		it('should get a recommendation by id', async () => {
			const recommendation = await createRecommendation();
			const spy = jest
				.spyOn(recommendationRepository, 'find')
				.mockImplementationOnce((): any => recommendation);
			jest.spyOn(
				recommendationRepository,
				'updateScore'
			).mockImplementationOnce((): any => {});
			await recommendationService.upvote(recommendation.id);
			expect(spy).toBeCalledWith(recommendation.id);
		});

		it('should not get a recommendation by id that not exist', async () => {
			const id = faker.datatype.number({ max: 0 });
			jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(
				(): any => {}
			);
			jest.spyOn(
				recommendationRepository,
				'updateScore'
			).mockImplementationOnce((): any => {});
			const result = recommendationService.upvote(id);
			expect(result).rejects.toEqual({ type: 'not_found', message: '' });
		});

		it('should call function updateScore with correct data', async () => {
			const recommendation = await createRecommendation();
			jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(
				(): any => recommendation
			);
			const spy = jest
				.spyOn(recommendationRepository, 'updateScore')
				.mockResolvedValueOnce(recommendation);
			await recommendationService.upvote(recommendation.id);
			expect(spy).toBeCalledWith(recommendation.id, 'increment');
		});
	});

	describe('downvote', () => {
		it('should call function find in repository with correct data', async () => {
			const recommendation = await createRecommendation();
			const spy = jest
				.spyOn(recommendationRepository, 'find')
				.mockImplementationOnce((): any => recommendation);
			jest.spyOn(
				recommendationRepository,
				'updateScore'
			).mockImplementationOnce((): any => {
				return { ...recommendation, score: -1 };
			});
			await recommendationService.downvote(recommendation.id);
			expect(spy).toBeCalledWith(recommendation.id);
		});

		it('should call function update score with decrement params in repository with correct data', async () => {
			const recommendation = await createRecommendation();
			jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(
				(): any => recommendation
			);
			const spy = jest
				.spyOn(recommendationRepository, 'updateScore')
				.mockImplementationOnce((): any => {
					return { ...recommendation, score: -1 };
				});
			await recommendationService.downvote(recommendation.id);
			expect(spy).toBeCalledWith(recommendation.id, 'decrement');
		});

		it('should call function delete recommendation when update recommendation set score lowest than -5', async () => {
			const recommendation = await createRecommendation({ score: -6 });
			jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(
				(): any => recommendation
			);
			jest.spyOn(
				recommendationRepository,
				'updateScore'
			).mockImplementationOnce((): any => {
				return { ...recommendation, score: recommendation.score - 1 };
			});
			const spy = jest
				.spyOn(recommendationRepository, 'remove')
				.mockImplementationOnce((): any => {});

			await recommendationService.downvote(recommendation.id);
			expect(spy).toBeCalledWith(recommendation.id);
		});

		it('should call function delete recommendation when update recommendation set score lowest than -5', async () => {
			const recommendation = await createRecommendation({
				score: -6,
			});
			jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(
				(): any => recommendation
			);
			jest.spyOn(
				recommendationRepository,
				'updateScore'
			).mockImplementationOnce((): any => {
				return {
					...recommendation,
					score: recommendation.score - 1,
				};
			});
			const spy = jest
				.spyOn(recommendationRepository, 'remove')
				.mockImplementationOnce((): any => {});

			await recommendationService.downvote(recommendation.id);
			expect(spy).toBeCalledWith(recommendation.id);
		});
	});

	describe('get', () => {
		it('should call function findAll recommendations', async () => {
			const recommendations = await Promise.all(
				_.times(5, async () => {
					return await createRecommendation();
				})
			);
			const spy = jest
				.spyOn(recommendationRepository, 'findAll')
				.mockImplementationOnce((): any => recommendations);

			const result = await recommendationService.get();
			expect(spy).toHaveBeenCalled();
			expect(result).toEqual(recommendations);
		});
	});

	describe('getTop', () => {
		it('should call function getAmountByScore recommendations', async () => {
			const amount = faker.datatype.number({ min: 1 });
			const recommendations = await Promise.all(
				_.times(10, async () => {
					return await createRecommendation();
				})
			);
			const spy = jest
				.spyOn(recommendationRepository, 'getAmountByScore')
				.mockImplementationOnce((): any => recommendations);

			const result = await recommendationService.getTop(amount);
			expect(spy).toHaveBeenCalledWith(amount);
			expect(result).not.toBeNull();
		});
	});

	describe('getById', () => {
		it('should call function find in recommendations repository', async () => {
			const recommendation = await createRecommendation();

			const spy = jest
				.spyOn(recommendationRepository, 'find')
				.mockImplementationOnce((): any => recommendation);

			const result = await recommendationService.getById(
				recommendation.id
			);
			expect(spy).toHaveBeenCalledWith(recommendation.id);
			expect(result).not.toBeNull();
		});

		it('should throw error for a id not found in recommendations', async () => {
			const id = faker.datatype.number({ max: 0 });

			jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(
				(): any => {}
			);

			const result = recommendationService.getById(id);
			expect(result).rejects.toEqual({
				type: 'not_found',
				message: '',
			});
		});
	});

	describe('getRandom', () => {
		it('should call findAll with gt into score filter param when math.random return < 0.7', async () => {
			const recommendations = await Promise.all(
				_.times(5, async () => {
					return await createRecommendation();
				})
			);
			const spy = jest
				.spyOn(recommendationRepository, 'findAll')
				.mockImplementationOnce((): any => recommendations);

			jest.spyOn(Math, 'random').mockReturnValue(0.6);

			await recommendationService.getRandom();
			expect(spy).toHaveBeenCalledWith({ score: 10, scoreFilter: 'gt' });
		});

		it('should call findAll with lte into score filter param when math.random return > 0.7', async () => {
			const recommendations = await Promise.all(
				_.times(5, async () => {
					return await createRecommendation();
				})
			);
			const spy = jest
				.spyOn(recommendationRepository, 'findAll')
				.mockImplementationOnce((): any => recommendations);

			jest.spyOn(Math, 'random').mockReturnValue(0.8);

			await recommendationService.getRandom();
			expect(spy).toHaveBeenCalledWith({ score: 10, scoreFilter: 'lte' });
		});

		it('should call findAll with random value for Math.random', async () => {
			const recommendations = await Promise.all(
				_.times(5, async () => {
					return await createRecommendation();
				})
			);
			const spy = jest
				.spyOn(recommendationRepository, 'findAll')
				.mockImplementationOnce((): any => recommendations);

			jest.spyOn(Math, 'random').mockReturnValue(
				faker.datatype.float({ min: 0, max: 1 })
			);

			await recommendationService.getRandom();
			expect(spy).toHaveBeenCalledWith({
				score: 10,
				scoreFilter: expect.stringMatching(/^(gt|lte)$/),
			});
		});

		it('should call findAll twice when does not exist recommendations with score > 10', async () => {
			const recommendations = await Promise.all(
				_.times(5, async () => {
					return await createRecommendation({
						score: faker.datatype.number({ min: 0, max: 9 }),
					});
				})
			);
			const spy = jest
				.spyOn(recommendationRepository, 'findAll')
				.mockImplementationOnce((): any => [])
				.mockImplementationOnce((): any => recommendations);

			jest.spyOn(Math, 'random').mockReturnValue(
				faker.datatype.float({ min: 0, max: 1 })
			);

			await recommendationService.getRandom();
			expect(spy).toHaveBeenCalledTimes(2);
		});

		it('should throw notFoundError when does not exists any recommendation', async () => {
			const spy = jest
				.spyOn(recommendationRepository, 'findAll')
				.mockResolvedValue([]);

			jest.spyOn(Math, 'random').mockReturnValue(
				faker.datatype.float({ min: 0, max: 1 })
			);

			const result = recommendationService.getRandom();
			expect(result).rejects.toEqual({ type: 'not_found', message: '' });
		});

		it('should return a random recommendation', async () => {
			const recommendations = await Promise.all(
				_.times(10, async () => {
					return await createRecommendation();
				})
			);
			const spy = jest
				.spyOn(recommendationRepository, 'findAll')
				.mockResolvedValue(recommendations);

			jest.spyOn(Math, 'random').mockReturnValue(
				faker.datatype.float({ min: 0, max: 1 })
			);
			const floor = faker.datatype.number({ min: 0, max: 10 });
			jest.spyOn(Math, 'floor').mockReturnValue(floor);

			const result = await recommendationService.getRandom();
			expect(result).toEqual(recommendations[floor]);
		});
	});

	describe('removeAll recommendations', () => {
		it('should clean database with deleteAll in enviroment of tests', async () => {
			const spy = jest
				.spyOn(recommendationRepository, 'removeAll')
				.mockImplementationOnce((): any => {});
			await recommendationService.deleteAll();
			expect(spy).toHaveBeenCalled();
		});
	});
});

afterAll(async () => {
	await cleanDatabase();
});
