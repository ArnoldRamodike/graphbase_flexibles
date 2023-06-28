'use client'

import React, { useState, useEffect} from 'react';
import { getProviders, signIn} from 'next-auth/react';
import Button from './Button';

type Provider = {
  id: string,
  name:string,
  type: string,
  signinUrl: string,
  callbackUrl: string,
  signinUrlParams?: Record<string, string> | undefined;
}

type Providers = Record<string, Provider>;

const AuthProviders = () => {
  const [providers, setproviders] = useState<Providers | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();

      setproviders(res);
    }
    fetchProviders();
  },[]);

  if (providers) {
    return (
      
      <div>
        {Object.values(providers).map((provider : Provider, i) => (
          <button key={i} onClick={() => signIn(provider?.id)}>
            {provider.id} 
          </button>
        ))}
        </div>
    )
  }
 
}

export default AuthProviders