'use server';

import { z } from 'zod';
import { FormSchema } from '../types';
import { createClient } from '@/utils/supabase/server';

export async function actionLogInUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  const supabase = createClient();
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return response;
}

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  const supabase = createClient();
  const { data } = await supabase.from('users').select('*').eq('email', email);

  if (data?.length) return { error: { message: 'User already exists' } };

  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`,
    },
  });

  return response;
}
