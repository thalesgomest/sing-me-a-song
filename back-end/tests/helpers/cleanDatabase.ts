import { prisma } from '../../src/database.js';

const cleanDatabase = async () => {
	await prisma.recommendation.deleteMany();
};

export default cleanDatabase;
