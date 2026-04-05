export type Transaction = {
	id: string;
	type: 'income' | 'expense';
	amount: number;
	date: string;
	title: string;
	category: string;
	payment_type: string;
};

export type Income = {
	id: string;
	user_id: string;
	amount: number;
	source: string;
	date: string;
};

export type Expense = {
	id: string;
	user_id: string;
	amount: number;
	category: string;
	payment_type: string;
	name: string;
	date: string;
};

export type LedgerBook = {
	id: number;
	user_id: string;
	name: string;
	description: string | null;
	created_at: string;
};

export type LedgerAccount = {
	id: number;
	user_id: string;
	ledger_book_id: number;
	name: string;
	contact_number: string | null;
	created_at: string;
};

export type LedgerEntry = {
	id: number;
	ledger_id: number;
	user_id: string;
	amount: number;
	description: string | null;
	date: string;
	type: 'give' | 'take';
	starred: boolean;
	created_at: string;
};
