/**
 * Created by rafaela on 24/09/25.
 */
/**
 * Controller Completo Corrigido - Sem usar associações Sequelize
 */
const Orcamento = require('../models/Orcamento');
const Cliente = require('../models/Cliente');

class OrcamentosController {

    // POST /api/orcamentos - Criar novo orçamento (JÁ FUNCIONANDO)
    static async create(req, res) {
    try {
        console.log('🎯 VERSÃO SIMPLES - Criando orçamento...');
        console.log('📦 Body:', req.body);

        const dadosOrcamento = req.body;

        // Validação mínima
        if (!dadosOrcamento.descricao || !dadosOrcamento.cliente_id) {
            return res.status(400).json({
                success: false,
                message: 'Descrição e cliente são obrigatórios'
            });
        }

        console.log('💾 Criando orçamento...');

        // CRIAR SEM BUSCAR DE VOLTA - apenas salvar
        const orcamento = await Orcamento.create(dadosOrcamento);

        console.log('✅ Orçamento criado! ID:', orcamento.id);

        // RETORNAR APENAS O QUE FOI CRIADO - sem buscar novamente
        res.status(201).json({
            success: true,
            message: 'Orçamento criado com sucesso',
            data: orcamento
        });

    } catch (error) {
        console.error('❌ Erro ao criar:', error.message);

        res.status(500).json({
            success: false,
            message: 'Erro ao criar orçamento',
            error: error.message
        });
    }
}

    // GET /api/orcamentos - Listar todos os orçamentos (CORRIGIDO)
    static async getAll(req, res) {
    try {
        console.log('📋 GET /api/orcamentos - Listando orçamentos...');
        const { page = 1, limit = 10, status, cliente_id } = req.query;

        let whereClause = {};
        if (status && status !== 'all') whereClause.status = status;
        if (cliente_id && cliente_id !== 'all') whereClause.cliente_id = cliente_id;

        const offset = (page - 1) * limit;

        // 1. BUSCAR ORÇAMENTOS SEM INCLUDE
        const { count, rows: orcamentos } = await Orcamento.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        // 2. BUSCAR CLIENTES SEPARADAMENTE
        const clientesIds = [...new Set(orcamentos.map(o => o.cliente_id).filter(id => id))];
        let clientesMap = {};

        if (clientesIds.length > 0) {
            const clientes = await Cliente.findAll({
                where: { id: clientesIds }
            });

            // Criar mapa para fácil acesso
            clientes.forEach(cliente => {
                clientesMap[cliente.id] = {
                    id: cliente.id,
                    name: cliente.name,
                    empresa: cliente.empresa || '',
                    valor: cliente.valor || 0
                };
        });
        }

        // 3. COMBINAR DADOS
        const orcamentosComClientes = orcamentos.map(orcamento => ({
                ...orcamento.toJSON(),
                cliente: clientesMap[orcamento.cliente_id] || null
    }));

        const totalPages = Math.ceil(count / limit);

        console.log(`✅ ${orcamentos.length} orçamentos encontrados`);

        res.json({
            success: true,
            data: {
                orcamentos: orcamentosComClientes,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: count,
                    items_per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro ao listar orçamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // GET /api/orcamentos/:id - Buscar orçamento por ID (JÁ CORRIGIDO)
    static async getById(req, res) {
    try {
        const { id } = req.params;
        console.log(`📄 GET /api/orcamentos/${id} - Buscando orçamento...`);

        // Buscar orçamento
        const orcamento = await Orcamento.findByPk(id);
        if (!orcamento) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }

        // Buscar cliente separadamente
        const cliente = await Cliente.findByPk(orcamento.cliente_id);

        // Montar resposta com cliente
        const orcamentoComCliente = {
                ...orcamento.toJSON(),
            cliente: cliente ? {
            id: cliente.id,
            name: cliente.name,
            empresa: cliente.empresa || '',
            valor: cliente.valor || 0
        } : null
    };

        console.log(`✅ Orçamento encontrado: ${orcamento.descricao}`);

        res.json({
            success: true,
            data: orcamentoComCliente
        });

    } catch (error) {
        console.error('❌ Erro ao buscar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // PUT /api/orcamentos/:id - Atualizar orçamento (CORRIGIDO)
    static async update(req, res) {
    try {
        const { id } = req.params;
        const dadosAtualizacao = req.body;
        const userId = req.user?.id || null;

        console.log(`✏️ PUT /api/orcamentos/${id} - Atualizando orçamento...`);

        const orcamento = await Orcamento.findByPk(id);

        if (!orcamento) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }

        // Se mudou o cliente, verificar se existe
        if (dadosAtualizacao.cliente_id && dadosAtualizacao.cliente_id !== orcamento.cliente_id) {
            const cliente = await Cliente.findByPk(dadosAtualizacao.cliente_id);
            if (!cliente) {
                return res.status(400).json({
                    success: false,
                    message: 'Cliente não encontrado'
                });
            }
        }

        await orcamento.update({
                ...dadosAtualizacao,
            updated_by: userId
    });

        // BUSCAR DADOS ATUALIZADOS SEM INCLUDE
        const orcamentoAtualizado = await Orcamento.findByPk(id);
        const cliente = await Cliente.findByPk(orcamentoAtualizado.cliente_id);

        const resultado = {
                ...orcamentoAtualizado.toJSON(),
            cliente: cliente ? {
            id: cliente.id,
            name: cliente.name,
            empresa: cliente.empresa || '',
            valor: cliente.valor || 0
        } : null
    };

        console.log(`✅ Orçamento atualizado: ${orcamento.descricao}`);

        res.json({
            success: true,
            message: 'Orçamento atualizado com sucesso',
            data: resultado
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar orçamento:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
        });
        }

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // DELETE /api/orcamentos/:id - Deletar orçamento (OK)
    static async delete(req, res) {
    try {
        const { id } = req.params;
        console.log(`🗑️ DELETE /api/orcamentos/${id} - Deletando orçamento...`);

        const orcamento = await Orcamento.findByPk(id);

        if (!orcamento) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }

        const descricaoOrcamento = orcamento.descricao; // Salvar antes de deletar
        await orcamento.destroy();

        console.log(`✅ Orçamento deletado: ${descricaoOrcamento}`);

        res.json({
            success: true,
            message: 'Orçamento deletado com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao deletar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // PUT /api/orcamentos/:id/status - Atualizar apenas o status (OK)
    static async updateStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id || null;

        console.log(`🔄 PUT /api/orcamentos/${id}/status - Atualizando status...`);

        const orcamento = await Orcamento.findByPk(id);

        if (!orcamento) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }

        const statusValidos = ['rascunho', 'finalizado', 'aprovado', 'rejeitado'];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status inválido'
            });
        }

        await orcamento.update({
            status,
            updated_by: userId
        });

        console.log(`✅ Status atualizado: ${orcamento.descricao} -> ${status}`);

        res.json({
            success: true,
            message: 'Status atualizado com sucesso',
            data: { id: orcamento.id, status: orcamento.status }
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // GET /api/orcamentos/stats - Estatísticas dos orçamentos (OK)
    static async getStats(req, res) {
    try {
        console.log('📊 GET /api/orcamentos/stats - Calculando estatísticas...');

        const [
            total,
            rascunhos,
            finalizados,
            aprovados,
            rejeitados
        ] = await Promise.all([
            Orcamento.count(),
            Orcamento.count({ where: { status: 'rascunho' } }),
            Orcamento.count({ where: { status: 'finalizado' } }),
            Orcamento.count({ where: { status: 'aprovado' } }),
            Orcamento.count({ where: { status: 'rejeitado' } })
        ]);

        // Valor total dos orçamentos
        const valorTotal = await Orcamento.sum('total_valor_final') || 0;

        // Orçamentos criados no mês atual
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const { Op } = require('sequelize');
        const novosMes = await Orcamento.count({
            where: {
                created_at: {
                    [Op.gte]: inicioMes
                }
            }
        });

        const stats = {
            total,
            por_status: {
                rascunhos,
                finalizados,
                aprovados,
                rejeitados
            },
            valor_total: valorTotal,
            novos_mes: novosMes
        };

        console.log('✅ Estatísticas calculadas:', stats);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}
}

module.exports = OrcamentosController;