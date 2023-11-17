import { describe, expect, it } from 'vitest';
import { createBuilder as _createBuilder } from '../';

describe('Query Builder', () => {
	it('should build a simple select query with all columns', () => {
		// Arrange.
		const usersBuilder = createBuilder('users');

		// Act.
		const sql = usersBuilder.select('*').build();

		// Assert.
		expect(sql).toBe('SELECT * FROM users');
	});

	it('should build a simple select query with specific columns', () => {
		// Arrange.
		const usersBuilder = createBuilder('users');

		// Act.
		const sql = usersBuilder.select(['id', 'userName']).build();

		// Assert.
		expect(sql).toBe('SELECT id, userName FROM users');
	});
});

function createBuilder<TTable extends keyof DatabaseSchema>(table: TTable) {
	return _createBuilder<DatabaseSchema, TTable>(table);
}

type DatabaseSchema = {
	users: {
		id: number;
		userName: string;
		password: string;
		isActive: boolean;
	};
	posts: {
		id: number;
		userId: DatabaseSchema['users']['id'];
		content: string;
	};
	comments: {
		id: number;
		userId: DatabaseSchema['users']['id'];
		postId: DatabaseSchema['posts']['id'];
		content: string;
	};
};
