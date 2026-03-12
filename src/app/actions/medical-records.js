'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createMedicalRecord(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const recordData = {
    user_id: user.id,
    patient_id: formData.get('patient_id'),
    date: formData.get('date') || new Date().toISOString(),
    content: formData.get('content'),
    diagnosis: formData.get('diagnosis'),
  };

  const { data, error } = await supabase
    .from('medical_records')
    .insert([recordData])
    .select();

  if (error) return { error: error.message };

  revalidatePath(`/patients/${recordData.patient_id}`);
  revalidatePath('/medical-records');
  return { data };
}

export async function deleteMedicalRecord(id, patientId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const { error } = await supabase
    .from('medical_records')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  if (patientId) revalidatePath(`/patients/${patientId}`);
  revalidatePath('/medical-records');
  return { success: true };
}

export async function updateMedicalRecord(id, formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const recordData = {
    patient_id: formData.get('patient_id'),
    date: formData.get('date'),
    content: formData.get('content'),
    diagnosis: formData.get('diagnosis'),
  };

  const { data, error } = await supabase
    .from('medical_records')
    .update(recordData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) return { error: error.message };

  if (recordData.patient_id) revalidatePath(`/patients/${recordData.patient_id}`);
  revalidatePath('/medical-records');
  return { data };
}
export async function listMedicalRecords() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('medical_records')
    .select('*, patients(name)')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) return [];
  return data || [];
}
