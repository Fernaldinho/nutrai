'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function registerPayment(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const paymentData = {
    user_id: user.id,
    patient_id: formData.get('patient_id'),
    amount: parseFloat(formData.get('amount')),
    date: formData.get('date') || new Date().toISOString().split('T')[0],
    category: formData.get('category') || 'Consulta',
    status: formData.get('status') || 'pago',
    notes: formData.get('notes'),
  };

  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select();

  if (error) return { error: error.message };

  revalidatePath('/financeiro');
  revalidatePath('/');
  return { data };
}

export async function deletePayment(id) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/financeiro');
  return { success: true };
}
export async function listPayments() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('payments')
    .select('*, patients(name)')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) return [];
  return data || [];
}
