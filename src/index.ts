import { QueryBuilder } from './query-builder';
import { Database } from './types';

export function createBuilder<
	TSchema extends Database,
	TTable extends keyof TSchema = keyof TSchema,
>(table: TTable) {
	return new QueryBuilder<TSchema, TTable>(table);
}
