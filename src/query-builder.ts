import { JoinClause } from './join-clause';
import {
	ColumnType,
	Database,
	NullableColumns,
	Operator,
	Relation,
	SameTypeColumns,
	Where,
} from './types';

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

	whereNull<TCurrentColumn extends NullableColumns<TDatabase, TTable>>(
		column: TCurrentColumn,
		relation: Relation = 'AND',
	): this {
		this.whereClauses.push({
			type: 'null',
			column: column.toString(),
			relation,
		});

		return this;
	}

	orWhereNull<TCurrentColumn extends NullableColumns<TDatabase, TTable>>(
		column: TCurrentColumn,
	): this {
		return this.whereNull(column, 'OR');
	}

	whereNotNull<TCurrentColumn extends NullableColumns<TDatabase, TTable>>(
		column: TCurrentColumn,
		relation: Relation = 'AND',
	): this {
		this.whereClauses.push({
			type: 'not-null',
			column: column.toString(),
			relation,
		});

		return this;
	}

	orWhereNotNull<TCurrentColumn extends NullableColumns<TDatabase, TTable>>(
		column: TCurrentColumn,
	): this {
		return this.whereNotNull(column, 'OR');
	}

	whereColumn<
		TCurrentColumn extends TColumn,
		TOtherColumn extends Exclude<
			SameTypeColumns<TDatabase, TTable, TCurrentColumn, TTable>,
			TCurrentColumn
		>,
	>(
		column: TCurrentColumn,
		operator: Operator,
		otherColumn: TOtherColumn,
		relation: Relation = 'AND',
	): this {
		this.whereClauses.push({
			type: 'column',
			leftColumn: column.toString(),
			operator,
			rightColumn: otherColumn.toString(),
			relation,
		});

		return this;
	}

	orWhereColumn<
		TCurrentColumn extends TColumn,
		TOtherColumn extends Exclude<
			SameTypeColumns<TDatabase, TTable, TCurrentColumn, TTable>,
			TCurrentColumn
		>,
	>(
		column: TCurrentColumn,
		operator: Operator,
		otherColumn: TOtherColumn,
	): this {
		return this.whereColumn(column, operator, otherColumn, 'OR');
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
			this.wrapWithBackticks(this.table.toString()),
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
				case 'basic': {
					const column = this.wrapWithBackticks(whereClause.column);

					wheres.push(
						`${whereClause.relation} ${column} ${whereClause.operator} ${whereClause.value}`,
					);
					break;
				}

				case 'null': {
					const column = this.wrapWithBackticks(whereClause.column);

					wheres.push(`${whereClause.relation} ${column} IS NULL`);
					break;
				}

				case 'not-null': {
					const column = this.wrapWithBackticks(whereClause.column);

					wheres.push(
						`${whereClause.relation} ${column} IS NOT NULL`,
					);
					break;
				}

				case 'column': {
					const leftColumn = this.wrapWithBackticks(
						whereClause.leftColumn,
					);

					const rightColumn = this.wrapWithBackticks(
						whereClause.rightColumn,
					);

					wheres.push(
						`${whereClause.relation} ${leftColumn} ${whereClause.operator} ${rightColumn}`,
					);
					break;
				}
			}
		}

		return wheres.join(' ');
	}

	private wrapWithBackticks<T extends string | string[]>(value: T): T {
		if (Array.isArray(value)) {
			return value.map(this.wrapWithBackticks) as T;
		}

		const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, '');

		return `\`${sanitized}\`` as T;
	}
}
