export type Table = Record<string, unknown>;
export type Database = Record<string, Table>;

export type Operator = '>' | '<' | '=';

export type Relation = 'AND' | 'OR';

export type Where =
	| {
			type: 'basic';
			column: string;
			operator: Operator;
			value: unknown;
			relation: Relation;
	  }
	| {
			type: 'null';
			column: string;
			relation: Relation;
	  }
	| {
			type: 'not-null';
			column: string;
			relation: Relation;
	  }
	| {
			type: 'column';
			leftColumn: string;
			operator: Operator;
			rightColumn: string;
			relation: Relation;
	  };

/**
 * Concat `TTable` and `TColumn` to be used in a `join` clause.
 * Not extending `string` because of `keyof` issues in the `QueryBuilder` class.
 * When using `Record<string, unknown>` as a generic `T`, `keyof T` returns `PropertyKey` instead of `string`.
 */
export type ColumnWithTable<TTable, TColumn> = TColumn extends string
	? TTable extends string
		? `${TTable}.${TColumn}`
		: never
	: never;

/**
 * Get the type of `TColumn` from table `TTable`.
 */
export type ColumnType<
	TDatabase extends Database,
	TTable extends keyof TDatabase,
	TColumn extends keyof TDatabase[TTable],
> = TDatabase[TTable][TColumn];

/**
 * Get the nullable columns of `TTable`.
 */
export type NullableColumns<
	TDatabase extends Database,
	TTable extends keyof TDatabase,
> = {
	[C in keyof TDatabase[TTable]]: TDatabase[TTable][C] extends NonNullable<
		TDatabase[TTable][C]
	>
		? never
		: C;
}[keyof TDatabase[TTable]];

/**
 * Get a union of columns names from `TOtherTable` that are assignable to the type of `TColumn` from table `TTable`.
 */
export type SameTypeColumns<
	TDatabase extends Database,
	TTable extends keyof TDatabase,
	TColumn extends keyof TDatabase[TTable],
	TOtherTable extends keyof TDatabase,
> = {
	[C in keyof TDatabase[TOtherTable]]: TDatabase[TOtherTable][C] extends TDatabase[TTable][TColumn]
		? C
		: never;
}[keyof TDatabase[TOtherTable]];
