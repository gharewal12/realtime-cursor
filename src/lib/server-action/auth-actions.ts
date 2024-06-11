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
