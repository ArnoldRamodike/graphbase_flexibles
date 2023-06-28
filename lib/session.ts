import { getServerSession} from 'next-auth/next';
import { NextAuthOptions, User} from 'next-auth';
import { AdapterUser} from 'next-auth/adapters';
import GoogleProviders from 'next-auth/providers/google'
import jsonwebtoken from 'jsonwebtoken';
import {JWT} from 'next-auth/jwt';
import { createUser, getUser } from './actions';
import { UserProfile, SessionInterface } from '@/common.types';


export const authOptions : NextAuthOptions = {
    providers: [
        GoogleProviders({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    jwt: {
        encode: ({secret, token}) => {
            const encodedToken = jsonwebtoken.sign({
                ...token,
                iss: 'grafbase',
                exp: Math.floor(Date.now()/ 1000) + 60 * 60
            }, secret)
            return encodedToken;
        },
        decode: async ({secret, token}) => {
            const decodeToken = jsonwebtoken.verify(token!, secret) as JWT;

            return decodeToken;
        }
    },
    theme: {
        colorScheme: 'light',
        logo: '/logo.svg',
    },
    callbacks: {
         async session({session}) {
            const email = session?.user?.email as string;

            try {
                const data = await getUser(email) as {user?: UserProfile}

                const newSessin = {
                    ...session,
                    user: {
                        ...session.user,
                        ...data?.user
                    }
                }
                return newSessin;
            } catch (error) {
                console.log('error retrieving data', error);
                return session;
            }
         
         },
        async signIn( {user} : {user: AdapterUser | User}){
            try {
                //Get user if exist or create them
                const userExists =  await getUser(user?.email as 
                    string) as {user?: UserProfile}
                
                if (!userExists.user) {
                    //create User
                    await createUser(
                        user.name as string, 
                        user.image as string,
                        user.image as string 
                    );
                }
                return true
            } catch (error: any) {
                console.log(error);
                return false;
                
            }
        }
    }
}

export async function getCurrentUser() {
    const session = await getServerSession(authOptions) as SessionInterface;

    return session;
}