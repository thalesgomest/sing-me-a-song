import { faker } from '@faker-js/faker';
import recommendationRepository from '../../src/repositories/recommendationRepository.js';
import { recommendationService } from '../../src/services/recommendationsService.js';
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
});
