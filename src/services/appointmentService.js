import { createClient } from '@/lib/supabase';

/**
 * SERVIÇO DE AGENDAMENTOS
 * Centraliza todas as chamadas ao Supabase relacionadas a agenda.
 */

export const appointmentService = {
  /**
   * Lista agendamentos com dados dos pacientes vinculados
   */
  async listAppointments() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(name)')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Busca consultas para o dia de hoje
   */
  async getTodayAppointments() {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(name)')
      .gte('date', `${today}T00:00:00`)
      .lte('date', `${today}T23:59:59`)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};
