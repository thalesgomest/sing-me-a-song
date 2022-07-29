import { prisma } from '../../src/database.js';

const cleanDatabase = async () => {
	await prisma.$executeRaw`TRUNCATE TABLE "recommendations" RESTART IDENTITY`;
};

export default cleanDatabase;
