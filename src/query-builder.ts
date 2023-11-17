import { JoinClause } from './join-clause';
import { ColumnType, Database, Operator } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars -- Currently the code is types-only */

export class QueryBuilder<
	TDatabase extends Database,
	TTable extends keyof TDatabase & string,
	TColumn extends keyof TDatabase[TTable] = keyof TDatabase[TTable],
> {
	private table: TTable;

	private columns: TColumn[] | '*' = '*';

	constructor(table: TTable) {
		this.table = table;
	}

	select(columns: '*' | TColumn[]): this {
		this.columns = columns;

		return this;
	}

	where<TCurrentColumn extends TColumn>(
		column: TCurrentColumn,
		operator: Operator,
		value: ColumnType<TDatabase, TTable, TCurrentColumn>,
	): this {
		return this;
	}

	join<TOtherTable extends Exclude<keyof TDatabase, TTable>>(
		otherTable: TOtherTable,
		joinCallback: (
			joinClause: JoinClause<TDatabase, TOtherTable, TTable>,
		) => void,
	): this {
		return this;
	}

	build(): string {
		const columns = this.compileColumns();

		return `SELECT ${columns} FROM ${this.table}`;
	}

	private compileColumns(): string {
		if (this.columns === '*') {
			return '*';
		}

		return this.columns.join(', ');
	}
}
