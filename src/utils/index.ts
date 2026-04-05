export const handleSmooth = (
	e: React.MouseEvent<HTMLAnchorElement>,
	id: string,
) => {
	e.preventDefault();
	document
		.getElementById(id)
		?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const getLocalDateString = (d: Date = new Date()) => {
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const getLocalTimeString = (d: Date = new Date()) => {
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
};
