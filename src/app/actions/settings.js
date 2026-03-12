'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// PROFILE ACTIONS
export async function getSettingsProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return { ...data, email: user.email };
}

export async function updateProfileSettings(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const rawData = Object.fromEntries(formData.entries());
  
  const updates = {};
  if (rawData.name !== undefined) updates.name = rawData.name;
  if (rawData.crn !== undefined) updates.crn = rawData.crn;
  if (rawData.avatar_url !== undefined) updates.avatar_url = rawData.avatar_url;
  if (rawData.whatsapp_number !== undefined) updates.whatsapp_number = rawData.whatsapp_number;
  if (rawData.whatsapp_message !== undefined) updates.whatsapp_message = rawData.whatsapp_message;
  if (rawData.custom_theme !== undefined) updates.custom_theme = rawData.custom_theme;
  if (rawData.custom_color !== undefined) updates.custom_color = rawData.custom_color;
  if (rawData.google_calendar_id !== undefined) updates.google_calendar_id = rawData.google_calendar_id;
  if (rawData.slug !== undefined) updates.slug = rawData.slug;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select();

  if (error) return { error: error.message };

  // Atualiza Email de Acesso, se aplicável
  if (rawData.email && rawData.email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({ email: rawData.email });
    if (authError) return { error: 'Erro ao atualizar email (pode requerer verificação).' };
  }

  revalidatePath('/configuracoes');
  revalidatePath('/');
  return { data };
}

// LOCATIONS ACTIONS
export async function listLocations() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function createLocation(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const { data, error } = await supabase
    .from('locations')
    .insert([{
      user_id: user.id,
      name: formData.get('name'),
      address: formData.get('address'),
    }])
    .select();

  if (error) return { error: error.message };

  revalidatePath('/configuracoes');
  return { data };
}

export async function deleteLocation(id) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/configuracoes');
  return { success: true };
}
export async function updateLocation(id, formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado' };

  const { data, error } = await supabase
    .from('locations')
    .update({
      name: formData.get('name'),
      address: formData.get('address'),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) return { error: error.message };

  revalidatePath('/configuracoes');
  return { data };
}

export async function getPublicProfileBySlug(slug) {
  const supabase = createClient();
  
  // Perfil
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (pError || !profile) return null;

  // Locais
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', profile.id);

  return { ...profile, locations: locations || [] };
}
