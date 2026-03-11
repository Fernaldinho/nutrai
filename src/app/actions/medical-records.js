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
  return { success: true };
}
