const { createDefaultPreset } = require('ts-jest');
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: 'node',
	transform: {
		...tsJestTransformCfg,
	},
	testMatch: ['**/?(*.)+(test|spec).[tj]s?(x)'],
	collectCoverageFrom: ['**/*.ts', '!**/__tests__/**', '!**/node_modules/**'],
};
