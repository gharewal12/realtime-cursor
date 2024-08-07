'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import GitHub from '@/components/icons/gitHubIcon';
import Loader from '@/components/global/Loader';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const GitHubSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleGitHubSignUp = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    setIsLoading(false);
    if (error) {
      router.replace(`${process.env.NEXT_PUBLIC_SITE_URL}dashboard`);
    }
  };

  return (
    <Button
      type="button"
      className="w-full p-6"
      disabled={isLoading}
      onClick={handleGitHubSignUp}
    >
      {!isLoading ? (
        <div className="flex items-center">
          Sign In with GitHub
          <span className="pl-2 text-xl">
            <GitHub />
          </span>
        </div>
      ) : (
        <Loader />
      )}
    </Button>
  );
};

export default GitHubSignIn;
