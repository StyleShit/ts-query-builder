import { describe, expect, it } from 'vitest';
import { helloWorld } from '..';

describe('Query Builder', () => {
	it('should return Hello World!', () => {
		expect(helloWorld()).toBe('Hello World!');
	});
});
