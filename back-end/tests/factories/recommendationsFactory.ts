import { faker } from '@faker-js/faker';
import { Recommendation } from '@prisma/client';
import { prisma } from '../../src/database.js';

export const createRecommendation = (): Promise<Recommendation> => {
	return prisma.recommendation.create({
		data: {
			name: faker.music.songName(),
			youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
			score: undefined,
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
