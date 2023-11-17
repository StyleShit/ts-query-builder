import { JoinClause } from './join-clause';
import { ColumnType, Database, Operator, Relation, Where } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars -- Currently the code is types-only */

export class QueryBuilder<
	TDatabase extends Database,
	TTable extends keyof TDatabase,
	TColumn extends keyof TDatabase[TTable] = keyof TDatabase[TTable],
> {
	private table: TTable;

	private columns: TColumn[] | '*' = '*';

	private whereClauses: Where[] = [];

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
		relation: Relation = 'AND',
	): this {
		this.whereClauses.push({
			type: 'basic',
			column: column.toString(),
			operator,
			value: value,
			relation,
		});

		return this;
	}

	orWhere<TCurrentColumn extends TColumn>(
		column: TCurrentColumn,
		operator: Operator,
		value: ColumnType<TDatabase, TTable, TCurrentColumn>,
	): this {
		return this.where(column, operator, value, 'OR');
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
		const sql: string[] = [
			'SELECT',
			this.compileColumns(),
			'FROM',
			this.table.toString(),
		];

		const whereClauses = this.compileWheres();

		if (whereClauses) {
			sql.push('WHERE', whereClauses);
		}

		return sql.join(' ');
	}

	private compileColumns(): string {
		if (this.columns === '*') {
			return '*';
		}

		return this.columns.join(', ');
	}

	private compileWheres(): string {
		if (this.whereClauses.length === 0) {
			return '';
		}

		const wheres = [
			'1 = 1', // A default statement for easier `WHERE` concatenation.
		];

		for (const whereClause of this.whereClauses) {
			switch (whereClause.type) {
				case 'basic':
					wheres.push(
						`${whereClause.relation} ${whereClause.column} ${whereClause.operator} ${whereClause.value}`,
					);
					break;
			}
		}

		return wheres.join(' ');
	}
}
