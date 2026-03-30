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
