const Cliente = require('../models/Cliente');

class ClientesController {
  static async getAll(req, res) {
    try {
      console.log('👥 Buscando todos os clientes...');
      
      const clientes = await Cliente.findAll({
        order: [['name', 'ASC']]
      });
      
      const clientesFormatados = clientes.map(cliente => ({
        id: cliente.id,
        name: cliente.name,
        email: cliente.email,
        phone: cliente.phone,
        empresa: cliente.empresa,
        cargo: cliente.cargo,
        status: cliente.status,
        calculations: cliente.calculations || 0,
        avatar: cliente.avatar,
        last_activity: cliente.last_activity,
        created_at: cliente.createdAt,
        updated_at: cliente.updatedAt,
        valor: cliente.valor || 150.00
      }));
      
      res.json({
        success: true,
        data: clientesFormatados
      });
      
    } catch (error) {
      console.error('❌ Erro:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  static async getForCalculadora(req, res) {
    try {
      console.log('🧮 Clientes para calculadora...');
      
      const clientes = await Cliente.findAll({
        where: { status: 'Ativo' },
        attributes: ['id', 'name', 'empresa', 'valor'],
        order: [['name', 'ASC']]
      });
      
      const result = clientes.map(c => ({
        id: c.id.toString(),
        nome: c.name,
        empresa: c.empresa,
        valor: parseFloat(c.valor) || 150.00
      }));
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('❌ Erro:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  static async getStats(req, res) {
    try {
      console.log('📊 Calculando estatísticas...');
      
      const clientes = await Cliente.findAll();
      
      const total = clientes.length;
      const ativos = clientes.filter(c => c.status === 'Ativo').length;
      const totalCalculos = clientes.reduce((sum, c) => sum + (c.calculations || 0), 0);
      
      const stats = {
        total,
        ativos,
        inativos: total - ativos,
        totalCalculos,
        novosNoMes: 0
      };
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('❌ Erro:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ClientesController;
