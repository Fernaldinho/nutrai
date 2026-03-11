import { createClient } from '@/lib/supabase';

/**
 * SERVIÇO FINANCEIRO
 * Centraliza todas as chamadas ao Supabase relacionadas ao financeiro.
 */

export const financialService = {
  /**
   * Lista todos os pagamentos com nomes dos pacientes
   */
  async listPayments() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*, patients(name)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Calcula o faturamento total do mês atual
   */
  async getMonthlyRevenue() {
    const supabase = createClient();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'pago')
      .gte('date', firstDay);
    
    if (error) throw error;
    
    return data.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }
};
