import {
	ColumnType,
	ColumnWithTable,
	Database,
	Operator,
	SameTypeColumns,
} from './types';

/* eslint-disable @typescript-eslint/no-unused-vars -- Currently the code is types-only */

export class JoinClause<
	TDatabase extends Database,
	TTable extends keyof TDatabase,
	TOtherTable extends keyof TDatabase,
	TColumn extends keyof TDatabase[TTable] = keyof TDatabase[TTable],
> {
	on<TCurrentColumn extends TColumn>(
		column: TCurrentColumn,
		operator: Operator,
		value: ColumnType<TDatabase, TTable, TCurrentColumn>,
	): this {
		return this;
	}

	onColumn<
		TCurrentColumn extends TColumn,
		TCompareColumn extends SameTypeColumns<
			TDatabase,
			TTable,
			TCurrentColumn,
			TOtherTable
		>,
	>(
		column: ColumnWithTable<TTable, TCurrentColumn>,
		operator: Operator,
		compareColumn: ColumnWithTable<TOtherTable, TCompareColumn>,
	): this {
		return this;
	}
}
