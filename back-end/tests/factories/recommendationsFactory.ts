import { faker } from '@faker-js/faker';
import { Recommendation } from '@prisma/client';
import { prisma } from '../../src/database.js';

export const createRecommendation = (
	recommendation: Partial<Recommendation> = {}
): Promise<Recommendation> => {
	return prisma.recommendation.create({
		data: {
			name: recommendation.name || faker.lorem.words(2),
			youtubeLink:
				recommendation.youtubeLink ||
				`https://www.youtube.com/${faker.datatype.uuid()}`,
			score: recommendation.score || undefined,
		},
	});
};

export const loadRecommendation = (id: number): Promise<Recommendation> => {
	return prisma.recommendation.findFirst({
		where: {
			id,
		},
	});
};
