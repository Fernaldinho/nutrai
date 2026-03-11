import { createClient } from '@/lib/supabase';

/**
 * SERVIÇO DE PACIENTES
 * Centraliza todas as chamadas ao Supabase relacionadas a pacientes.
 */

export const patientService = {
  /**
   * Lista todos os pacientes do usuário logado
   */
  async listPatients() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Busca os detalhes e o histórico completo de um paciente
   * @param {string} id - ID do paciente 
   */
  async getPatientWithHistory(id) {
    const supabase = createClient();
    
    const [patientRes, recordsRes, appointmentsRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', id).single(),
      supabase.from('medical_records').select('*').eq('patient_id', id).order('date', { ascending: false }),
      supabase.from('appointments').select('*').eq('patient_id', id).order('date', { ascending: false })
    ]);

    if (patientRes.error) throw patientRes.error;

    return {
      patient: patientRes.data,
      records: recordsRes.data || [],
      appointments: appointmentsRes.data || []
    };
  }
};
