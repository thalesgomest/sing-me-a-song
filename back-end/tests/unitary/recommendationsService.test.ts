import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';
import { recommendationService } from '../../src/services/recommendationsService';
import { jest } from '@jest/globals';
import {
	createRecommendationData,
	createRecommendation,
	loadRecommendation,
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
			const spy = jest.spyOn(recommendationRepository, 'create');
			jest.spyOn(
				recommendationRepository,
				'findByName'
			).mockImplementationOnce((): any => {});

			await recommendationService.insert(recommendation);
			expect(spy).toBeCalledWith(recommendation);
		});

		it('should call function findByName with correct createDataRecommentadion', async () => {
			const recommendation = createRecommendationData();
			const spy = jest.spyOn(recommendationRepository, 'findByName');
			jest.spyOn(
				recommendationRepository,
				'create'
			).mockImplementationOnce((): any => {});
			await recommendationService.insert(recommendation);
			expect(spy).toBeCalledWith(recommendation.name);
		});

		it('should throw error when have a conflict name', async () => {
			const { id } = await createRecommendation();
			const recommendation = await loadRecommendation(id);
			console.log(recommendation);
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
});
