import { describe, expectTypeOf, it } from 'vitest';
import { createBuilder as _createBuilder } from '../';

describe('Query Builder', () => {
	it('should build a simple query', () => {
		// Arrange.
		const usersBuilder = createBuilder('users');

		// Act.
		const sql = usersBuilder
			.select(['id', 'userName'])
			.where('isActive', '=', true)
			.join('posts', (joinClause) => {
				joinClause
					.on('content', '=', 'asdasd')
					.onColumn('posts.userId', '=', 'users.id');
			})
			.join('comments', (joinClause) => {
				joinClause.onColumn('comments.userId', '=', 'users.id');
			})
			.build();

		// Assert.
		expectTypeOf(sql).toEqualTypeOf<string>();
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
