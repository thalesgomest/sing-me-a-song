/// <reference types="cypress" />

import { faker } from '@faker-js/faker';
import _ from 'lodash';

describe('homepage', () => {
	const recommendation = {
		name: faker.lorem.word(10),
		youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
	};
	it('should add a new recommendation', () => {
		cy.visit('http://localhost:3000');
		cy.request('POST', 'http://localhost:5000/recommendations', {
			name: faker.name.findName(),
			youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
		}).as('postRecommendation');

		cy.get("input[type='text']").type(recommendation.name);
		cy.get("input[type='link']").type(recommendation.youtubeLink);
		cy.get('.create-new-recommendation-button').click();
	});

	it('should plus +1 score when click on upvote icon', () => {
		cy.get('.go-arrow-up-icon').click({ multiple: true });
	});

	it('should plus -1 score when click on downvote icon', () => {
		cy.get('.go-arrow-down-icon').click({ multiple: true });
	});

	it('should remove a recommendation when click on downvote icon and score point is < -5', () => {
		_.times(6, () => {
			cy.get(`#${recommendation.name}`).click({ multiple: true });
		});
	});
});

describe('random page', () => {
	it('should show only one random recommendation', () => {
		cy.visit('http://localhost:3000/random');
		cy.intercept('GET', '/recommendations/random').as('getRecommendations');
		cy.wait('@getRecommendations');
		cy.get('article').should('have.length', 1);
		console.log('article', cy.get('article'));
	});
});

describe('top page', () => {
	it('should shows at most 10 recommendations', () => {
		cy.visit('http://localhost:3000/top');
		cy.intercept('GET', '/recommendations/top/10').as('getRecommendations');
		cy.wait('@getRecommendations');
		cy.get('article').should('be.length.lte', 10);
	});
});

after(() => {
	cy.resetDB();
});
