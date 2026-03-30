'use client';

import { Expense } from '@/types';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	ChartOptions,
	TooltipItem,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
);

const COLORS = [
	'rgba(99, 102, 241, 0.9)',
	'rgba(16, 185, 129, 0.9)',
	'rgba(244, 63, 94, 0.9)',
	'rgba(245, 158, 11, 0.9)',
	'rgba(14, 165, 233, 0.9)',
	'rgba(168, 85, 247, 0.9)',
	'rgba(236, 72, 153, 0.9)',
	'rgba(34, 197, 94, 0.9)',
	'rgba(251, 146, 60, 0.9)',
	'rgba(132, 204, 22, 0.9)',
	'rgba(59, 130, 246, 0.9)',
	'rgba(217, 70, 239, 0.9)',
];

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

interface ExpenseChartsProps {
	expenses: Expense[];
}

/* -------------------- CATEGORY CHART -------------------- */

export function CategoriesChart({ expenses }: ExpenseChartsProps) {
	if (!expenses.length) {
		return (
			<div className='flex h-full items-center justify-center text-slate-400'>
				No data available yet
			</div>
		);
	}

	const categoriesMap = expenses.reduce<Record<string, number>>(
		(acc, curr) => {
			acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
			return acc;
		},
		{},
	);

	const sorted = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);

	const labels = sorted.map(([key]) => key);
	const values = sorted.map(([_, val]) => val);

	const data = {
		labels,
		datasets: [
			{
				data: values,
				backgroundColor: labels.map(
					(_, i) => COLORS[i % COLORS.length],
				),
				borderWidth: 0,
				hoverOffset: 8,
			},
		],
	};

	const options: ChartOptions<'doughnut'> = {
		responsive: true,
		maintainAspectRatio: false,
		layout: { padding: 10 },
		plugins: {
			legend: {
				position: 'bottom',
				labels: {
					padding: 16,
					usePointStyle: true,
					font: { family: "'Geist', sans-serif", size: 12 },
				},
			},
			tooltip: {
				backgroundColor: 'rgba(15, 23, 42, 0.95)',
				padding: 12,
				displayColors: false,
				callbacks: {
					label: (ctx: TooltipItem<'doughnut'>) =>
						formatCurrency(ctx.raw as number),
				},
			},
		},
		cutout: '70%',
		animation: {
			animateScale: true,
			animateRotate: true,
			duration: 1200,
			easing: 'easeOutQuart',
		},
	};

	return (
		<Doughnut
			data={data}
			options={options}
		/>
	);
}

/* -------------------- TREND CHART -------------------- */

export function TrendChart({ expenses }: ExpenseChartsProps) {
	if (!expenses.length) {
		return (
			<div className='flex h-full items-center justify-center text-slate-400'>
				No data available yet
			</div>
		);
	}

	const map: Record<string, number> = {};

	expenses.forEach((e) => {
		const d = new Date(e.date);
		const key = d.toISOString().split('T')[0];
		map[key] = (map[key] || 0) + e.amount;
	});

	const sorted = Object.entries(map).sort(
		(a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
	);

	const labels = sorted.map(([date]) =>
		new Date(date).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
		}),
	);

	const values = sorted.map(([_, val]) => val);

	const data = {
		labels,
		datasets: [
			{
				label: 'Daily Spending',
				data: values,
				backgroundColor: 'rgba(99, 102, 241, 0.9)',
				borderRadius: 8,
				barPercentage: 0.5,
				categoryPercentage: 0.6,
			},
		],
	};

	const options: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		layout: { padding: 10 },
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: 'rgba(15, 23, 42, 0.95)',
				padding: 12,
				callbacks: {
					label: (ctx: TooltipItem<'bar'>) =>
						formatCurrency(ctx.raw as number),
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: 'rgba(148, 163, 184, 0.08)',
				},
				border: { display: false },
				ticks: {
					callback: (val) => `₹${val}`,
				},
			},
			x: {
				grid: { display: false },
				border: { display: false },
			},
		},
		animation: {
			duration: 1200,
			easing: 'easeOutQuart',
		},
	};

	return (
		<Bar
			data={data}
			options={options}
		/>
	);
}
