import type { NextConfig } from "next";

const securityHeaders = [
	// Never let the site be framed — blocks clickjacking
	{ key: 'X-Frame-Options', value: 'DENY' },
	// Browsers must respect declared content types
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	// Don't leak full URLs to third-party origins
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	// The app uses none of these device APIs
	{
		key: 'Permissions-Policy',
		value: 'camera=(), microphone=(), geolocation=(), payment=()',
	},
];

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
