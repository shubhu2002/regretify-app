'use client';

import { Expense } from '@/types';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	Filler,
	ChartOptions,
	TooltipItem,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	Filler,
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
		layout: { padding: 8 },
		plugins: {
			legend: { display: false },
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
		<div className='flex flex-col h-full gap-3'>
			{/* Doughnut */}
			<div className='relative flex-1 min-h-0'>
				<Doughnut
					data={data}
					options={options}
				/>
			</div>

			{/* Custom legend with amounts */}
			<div className='space-y-1.5 grid grid-cols-2 gap-x-5 overflow-y-auto max-h-36 pr-1 mt-4 sm:mt-0'>
				{sorted.map(([cat, amt], i) => (
					<div
						key={cat}
						className='flex items-center justify-between gap-2'
					>
						<div className='flex items-center gap-2 min-w-0'>
							<span
								className='w-2.5 h-2.5 rounded-full shrink-0'
								style={{
									backgroundColor: COLORS[
										i % COLORS.length
									].replace('0.9)', '1)'),
								}}
							/>
							<span className='text-sm text-slate-600 dark:text-slate-300 truncate'>
								{cat}
							</span>
						</div>
						<span className='text-sm font-semibold text-slate-700 dark:text-slate-200 shrink-0 tabular-nums'>
							₹{amt.toLocaleString('en-IN')}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* -------------------- TREND CHART -------------------- */

function createGradient(ctx: CanvasRenderingContext2D, area: { top: number; bottom: number }) {
	const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
	g.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
	g.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
	g.addColorStop(1, 'rgba(139, 92, 246, 0)');
	return g;
}

const gradientPlugin = {
	id: 'gradientFill',
	beforeDraw(chart: ChartJS<'line'>) {
		const area = chart.chartArea;
		if (!area) return;
		const ds = chart.data.datasets[0];
		if (ds && !(ds.backgroundColor instanceof CanvasGradient)) {
			ds.backgroundColor = createGradient(chart.ctx, area);
		}
	},
};

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

	const dates = sorted.map(([date]) => new Date(date));
	const values = sorted.map(([_, val]) => val);
	const total = values.reduce((s, v) => s + v, 0);

	const monthName = dates[0]?.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

	const labels = dates.map((d) => d.getDate().toString());

	const data = {
		labels,
		datasets: [
			{
				label: 'Daily Spending',
				data: values,
				borderColor: 'rgba(139, 92, 246, 1)',
				backgroundColor: 'rgba(139, 92, 246, 0.15)',
				borderWidth: 2,
				fill: true,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: '#fff',
				pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
				pointHoverBorderWidth: 2.5,
			},
		],
	};

	const options: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		layout: { padding: { top: 8, right: 12, bottom: 4, left: 4 } },
		interaction: {
			mode: 'index',
			intersect: false,
		},
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: 'rgba(15, 23, 42, 0.92)',
				borderColor: 'rgba(139, 92, 246, 0.25)',
				borderWidth: 1,
				padding: { top: 8, bottom: 8, left: 12, right: 12 },
				cornerRadius: 8,
				titleFont: { size: 11, weight: 'normal' },
				titleColor: 'rgba(148, 163, 184, 0.8)',
				bodyFont: { size: 13, weight: 'bold' },
				bodyColor: '#c4b5fd',
				displayColors: false,
				callbacks: {
					title: (items) => {
						const idx = items[0]?.dataIndex;
						if (idx == null) return '';
						return dates[idx].toLocaleDateString('en-IN', {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						});
					},
					label: (ctx: TooltipItem<'line'>) =>
						formatCurrency(ctx.raw as number),
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: 'rgba(148, 163, 184, 0.06)',
					drawTicks: false,
				},
				border: { display: false },
				ticks: {
					padding: 8,
					maxTicksLimit: 6,
					color: 'rgba(148, 163, 184, 0.45)',
					font: { size: 10 },
					callback: (val) => {
						const v = Number(val);
						if (v >= 1000) return `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
						return `₹${v}`;
					},
				},
			},
			x: {
				grid: { display: false },
				border: { display: false },
				ticks: {
					color: 'rgba(148, 163, 184, 0.45)',
					font: { size: 10 },
					maxRotation: 0,
					autoSkip: true,
					maxTicksLimit: 12,
					padding: 4,
				},
			},
		},
		animation: {
			duration: 1200,
			easing: 'easeOutQuart',
		},
	};

	return (
		<div className='flex flex-col h-full'>
			<div className='flex-1 min-h-0'>
				<Line data={data} options={options} plugins={[gradientPlugin]} />
			</div>
			<div className='flex items-center gap-2.5 px-4 pt-2 pb-1'>
				<span className='text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums'>
					{formatCurrency(total)}
				</span>
				<span className='text-[10px] text-slate-400 dark:text-slate-500'>total</span>
				<span className='w-px h-3 bg-slate-200 dark:bg-slate-700/60' />
				<span className='text-[10px] text-slate-400 dark:text-slate-500'>{monthName}</span>
			</div>
		</div>
	);
}
