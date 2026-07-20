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
import { motion } from 'framer-motion';

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
	'#9294e5',
	'#d39dbd',
	'#cbf1fd',
	'#f0f8e8',
	'rgba(255, 255, 255, 0.85)',
	'rgba(255, 255, 255, 0.65)',
	'rgba(255, 255, 255, 0.5)',
	'rgba(255, 255, 255, 0.38)',
	'rgba(255, 255, 255, 0.28)',
	'rgba(255, 255, 255, 0.2)',
	'rgba(255, 255, 255, 0.14)',
	'rgba(255, 255, 255, 0.1)',
];

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

interface ExpenseChartsProps {
	expenses: Expense[];
}

/* -------------------- CATEGORY BARS (ranked list view) -------------------- */

export function CategoryBars({ expenses }: ExpenseChartsProps) {
	if (!expenses.length) {
		return (
			<div className='flex h-full items-center justify-center text-white/40'>
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
	const total = sorted.reduce((s, [, v]) => s + v, 0);
	const max = sorted[0]?.[1] || 1;

	return (
		<div className='absolute inset-0 overflow-y-auto pr-1 space-y-3.5'>
			{sorted.map(([name, value], i) => {
				const color = COLORS[i % COLORS.length];
				const pctOfTotal =
					total > 0 ? Math.round((value / total) * 100) : 0;
				return (
					<div key={name}>
						<div className='flex items-center justify-between gap-3 text-sm mb-1.5'>
							<span className='flex items-center gap-2 text-white/80 font-medium truncate min-w-0'>
								<span
									className='w-2.5 h-2.5 rounded-full shrink-0'
									style={{ backgroundColor: color }}
								/>
								<span className='truncate'>{name}</span>
							</span>
							<span className='text-white font-semibold tabular-nums shrink-0'>
								{formatCurrency(value)}
								<span className='text-white/35 font-medium text-xs ml-1.5'>
									{pctOfTotal}%
								</span>
							</span>
						</div>
						<div className='h-2 bg-white/10 rounded-full overflow-hidden'>
							<motion.div
								initial={{ width: 0 }}
								animate={{
									width: `${(value / max) * 100}%`,
								}}
								transition={{
									duration: 0.8,
									ease: 'easeOut',
									delay: i * 0.05,
								}}
								className='h-full rounded-full'
								style={{
									backgroundColor: color,
									boxShadow:
										color.startsWith('#') ?
											`0 0 10px ${color}66`
										:	'none',
								}}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/* -------------------- CATEGORY CHART -------------------- */

export function CategoriesChart({ expenses }: ExpenseChartsProps) {
	if (!expenses.length) {
		return (
			<div className='flex h-full items-center justify-center text-white/40'>
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
				backgroundColor: '#101013',
				borderColor: 'rgba(255, 255, 255, 0.1)',
				borderWidth: 1,
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
							<span className='text-sm text-white/60 truncate'>
								{cat}
							</span>
						</div>
						<span className='text-sm font-semibold text-white/80 shrink-0 tabular-nums'>
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
	g.addColorStop(0, 'rgba(146, 148, 229, 0.25)');
	g.addColorStop(0.5, 'rgba(146, 148, 229, 0.07)');
	g.addColorStop(1, 'rgba(146, 148, 229, 0)');
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
			<div className='flex h-full items-center justify-center text-white/40'>
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
				borderColor: '#9294e5',
				backgroundColor: 'rgba(146, 148, 229, 0.1)',
				borderWidth: 2,
				fill: true,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: '#101013',
				pointHoverBorderColor: '#ffffff',
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
				backgroundColor: '#101013',
				borderColor: 'rgba(255, 255, 255, 0.1)',
				borderWidth: 1,
				padding: { top: 8, bottom: 8, left: 12, right: 12 },
				cornerRadius: 8,
				titleFont: { size: 11, weight: 'normal' },
				titleColor: 'rgba(255, 255, 255, 0.4)',
				bodyFont: { size: 13, weight: 'bold' },
				bodyColor: '#ffffff',
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
					color: 'rgba(255, 255, 255, 0.08)',
					drawTicks: false,
				},
				border: { display: false },
				ticks: {
					padding: 8,
					maxTicksLimit: 6,
					color: 'rgba(255, 255, 255, 0.4)',
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
					color: 'rgba(255, 255, 255, 0.4)',
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
				<span className='text-xs font-semibold text-white/80 tabular-nums'>
					{formatCurrency(total)}
				</span>
				<span className='text-[10px] text-white/40'>total</span>
				<span className='w-px h-3 bg-white/10' />
				<span className='text-[10px] text-white/40'>{monthName}</span>
			</div>
		</div>
	);
}
