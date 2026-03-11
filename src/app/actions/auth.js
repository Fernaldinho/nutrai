'use server';

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  
  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('⛔ Supabase Login Error:', error.message);
    return { error: error.message };
  }

  redirect('/');
}

export async function signup(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const nome = formData.get('name'); // Opcional salvar metadata
  
  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome: nome,
      }
    }
  });

  if (error) {
    console.error('⛔ Supabase Signup Error:', error.message);
    return { error: error.message };
  }

  redirect('/login?message=Verifique seu email para confirmar a conta');
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
