'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function listAppointments() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function createAppointment(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const appointmentData = {
    user_id: user.id,
    patient_id: formData.get('patient_id'),
    date: formData.get('date'), // ISO String
    notes: formData.get('notes'),
    status: formData.get('status') || 'pendente',
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select();

  if (error) return { error: error.message };

  revalidatePath('/agenda');
  revalidatePath('/');
  return { data };
}

export async function updateAppointmentStatus(id, status) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) return { error: error.message };

  revalidatePath('/agenda');
  revalidatePath('/');
  return { data };
}

export async function deleteAppointment(id) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/agenda');
  return { success: true };
}
