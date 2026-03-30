import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase } from '@/supabase';

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),

		CredentialsProvider({
			name: 'Email and Password',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},

			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error('Invalid credentials');
				}

				const { data: user, error } = await supabase
					.from('regretify-users')
					.select('*')
					.eq('email', credentials.email)
					.single();

				if (error || !user) {
					throw new Error('User not found');
				}

				if (!user.password) {
					throw new Error('User uses OAuth provider');
				}

				const isValid = await bcrypt.compare(
					credentials.password,
					user.password,
				);

				if (!isValid) {
					throw new Error('Invalid password');
				}

				// ✅ RETURN FULL USER
				return {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.profile || null,
					age: user.age ?? null,
					contact_number: user.contact_number ?? null,
				};
			},
		}),
	],

	pages: {
		signIn: '/',
	},

	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === 'google') {
				if (!user.email) return false;

				const { data: existingUser } = await supabase
					.from('regretify-users')
					.select('*')
					.eq('email', user.email)
					.single();

				if (!existingUser) {
					// ✅ CREATE USER WITH NULL FIELDS
					const { data: createdUser, error } = await supabase
						.from('regretify-users')
						.insert({
							email: user.email,
							name: user.name || '',
							profile: user.image || '',
							age: null,
							gender: null,
							contact_number: null,
							password: null,
						})
						.select()
						.single();

					if (error) {
						console.error('OAUTH SYNCHRONIZATION ERROR:', error);
						return false;
					}

					// ✅ ATTACH FULL DATA TO USER
					user.id = createdUser.id;
					user.age = createdUser.age;
					user.contact_number = createdUser.contact_number;
					user.image = createdUser.profile;
				} else {
					// ✅ EXISTING USER
					user.id = existingUser.id;
					user.age = existingUser.age;
					user.contact_number = existingUser.contact_number;
					user.image = existingUser.profile;
				}
			}

			return true;
		},

		async jwt({ token, user }) {
			// Runs on login
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;

				token.age = user.age ?? null;
				token.contact_number = user.contact_number ?? null;
				token.profile = user.image ?? null;
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.name = token.name as string;

				session.user.age = token.age as number | null;
				session.user.contact_number = token.contact_number as
					| string
					| null;
				session.user.image = token.profile as string | null;
			}

			return session;
		},
	},

	session: {
		strategy: 'jwt',
	},
};
