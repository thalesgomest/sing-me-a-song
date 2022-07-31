import { prisma } from '../src/database.js';

const main = async () => {
	const recommendations = [
		{
			name: 'All That Really Matters',
			youtubeLink: 'https://www.youtube.com/watch?v=3gxxW5NqICc',
		},
		{
			name: 'Feels Like Home (Radio Edit)',
			youtubeLink: 'https://www.youtube.com/watch?v=5CY1vbxP4Jo',
		},
		{
			name: 'Numb',
			youtubeLink: 'https://www.youtube.com/watch?v=mRXKnG2eugU',
		},
	];

	await prisma.recommendation.createMany({
		data: recommendations,
	});
};

main()
	.catch((err) => console.error(err))
	.finally(async () => prisma.$disconnect());
