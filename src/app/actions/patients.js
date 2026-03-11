'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function listPatients() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .order('name');
    
  if (error) return [];
  return data || [];
}

export async function createPatient(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const patientData = {
    user_id: user.id,
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    birth_date: formData.get('birth_date'),
    notes: formData.get('notes'),
  };

  const { data, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select();

  if (error) return { error: error.message };

  revalidatePath('/patients');
  return { data };
}

export async function updatePatient(id, formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const patientData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    birth_date: formData.get('birth_date'),
    notes: formData.get('notes'),
  };

  const { data, error } = await supabase
    .from('patients')
    .update(patientData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) return { error: error.message };

  revalidatePath('/patients');
  return { data };
}

export async function deletePatient(id) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/patients');
  return { success: true };
}
