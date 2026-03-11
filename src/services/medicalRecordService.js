import { createClient } from '@/lib/supabase';

export const medicalRecordService = {
  /**
   * Lista todos os registros médicos (diários) ordenados cronologicamente
   */
  async listRecords() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('medical_records')
      .select('*, patients(name)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};
