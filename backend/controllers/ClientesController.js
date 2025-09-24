const Cliente = require('../models/Cliente');

class ClientesController {
    // GET /api/clientes - Listar todos os clientes
    static async getAll(req, res) {
    try {
        console.log('👥 GET /api/clientes - Buscando todos os clientes...');
        const { search } = req.query;

        let whereClause = {};

        // Se há termo de busca, criar filtro
        if (search && search.trim() !== '') {
            const { Op } = require('sequelize');
            whereClause = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { empresa: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const clientes = await Cliente.findAll({
            where: whereClause,
            order: [['name', 'ASC']]
        });

        // Mapear para formato esperado pelo frontend
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
                valor: parseFloat(cliente.valor) || 150.00
            }));

        console.log(`✅ ${clientesFormatados.length} clientes encontrados`);

        res.json({
            success: true,
            data: clientesFormatados
        });

    } catch (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // GET /api/clientes/calculadora - Clientes para calculadora (formato específico)
    static async getForCalculadora(req, res) {
    try {
        console.log('🧮 GET /api/clientes/calculadora - Clientes para calculadora...');

        const clientes = await Cliente.findAll({
            where: {
                status: 'Ativo'
            },
            attributes: ['id', 'name', 'empresa', 'valor'],
            order: [['name', 'ASC']]
        });

        // Formato específico para calculadora
        const clientesCalculadora = clientes.map(cliente => ({
                id: cliente.id.toString(),
                nome: cliente.name, // Mapear name -> nome
                empresa: cliente.empresa,
                valor: parseFloat(cliente.valor) || 150.00
            }));

        console.log(`✅ ${clientesCalculadora.length} clientes para calculadora`);

        res.json({
            success: true,
            data: clientesCalculadora
        });

    } catch (error) {
        console.error('❌ Erro ao buscar clientes para calculadora:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // GET /api/clientes/stats - Estatísticas dos clientes
    static async getStats(req, res) {
    try {
        console.log('📊 GET /api/clientes/stats - Calculando estatísticas...');

        // Buscar todos os clientes para cálculos
        const clientes = await Cliente.findAll();

        const total = clientes.length;
        const ativos = clientes.filter(cliente => cliente.status === 'Ativo').length;
        const inativos = total - ativos;

        // Calcular total de cálculos
        const totalCalculos = clientes.reduce((sum, cliente) => {
                return sum + (cliente.calculations || 0);
    }, 0);

        // Calcular novos clientes no mês atual
        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

        const novosNoMes = clientes.filter(cliente => {
                return cliente.createdAt && new Date(cliente.createdAt) >= inicioMes;
    }).length;

        const stats = {
            total,
            ativos,
            inativos,
            totalCalculos,
            novosNoMes
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

    // GET /api/clientes/:id - Buscar cliente por ID
    static async getById(req, res) {
    try {
        const { id } = req.params;
        console.log(`👤 GET /api/clientes/${id} - Buscando cliente por ID...`);

        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
        }

        // Formato completo
        const clienteFormatado = {
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
            valor: parseFloat(cliente.valor) || 150.00
        };

        console.log(`✅ Cliente encontrado: ${cliente.name}`);

        res.json({
            success: true,
            data: clienteFormatado
        });

    } catch (error) {
        console.error('❌ Erro ao buscar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // POST /api/clientes - Criar novo cliente
    static async create(req, res) {
    try {
        console.log('➕ POST /api/clientes - Criando novo cliente...');

        const {
            name,
            email,
            phone,
            empresa,
            cargo,
            status,
            valor
        } = req.body;

        // Validações básicas
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Nome e email são obrigatórios'
            });
        }

        // Verificar se email já existe
        const clienteExistente = await Cliente.findOne({
            where: { email }
        });

        if (clienteExistente) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        const cliente = await Cliente.create({
            name,
            email,
            phone: phone || null,
            empresa: empresa || null,
            cargo: cargo || null,
            status: status || 'Ativo',
            calculations: 0,
            valor: valor || 150.00
            // avatar será gerado automaticamente pelo hook do modelo
        });

        console.log(`✅ Cliente criado: ${cliente.name} (ID: ${cliente.id})`);

        res.status(201).json({
            success: true,
            message: 'Cliente criado com sucesso',
            data: {
                id: cliente.id,
                name: cliente.name,
                email: cliente.email,
                phone: cliente.phone,
                empresa: cliente.empresa,
                cargo: cliente.cargo,
                status: cliente.status,
                calculations: cliente.calculations,
                avatar: cliente.avatar,
                valor: cliente.valor,
                created_at: cliente.createdAt,
                updated_at: cliente.updatedAt
            }
        });

    } catch (error) {
        console.error('❌ Erro ao criar cliente:', error);

        // Tratar erro de validação do Sequelize
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

    // PUT /api/clientes/:id - Atualizar cliente
    static async update(req, res) {
    try {
        const { id } = req.params;
        console.log(`✏️ PUT /api/clientes/${id} - Atualizando cliente...`);

        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
        }

        const {
            name,
            email,
            phone,
            empresa,
            cargo,
            status,
            valor
        } = req.body;

        // Verificar se email já existe em outro cliente
        if (email && email !== cliente.email) {
            const { Op } = require('sequelize');
            const emailExistente = await Cliente.findOne({
                where: {
                    email,
                    id: { [Op.ne]: id }
                }
            });

            if (emailExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já está em uso por outro cliente'
                });
            }
        }

        // Atualizar campos fornecidos
        await cliente.update({
            name: name || cliente.name,
            email: email || cliente.email,
            phone: phone !== undefined ? phone : cliente.phone,
            empresa: empresa !== undefined ? empresa : cliente.empresa,
            cargo: cargo !== undefined ? cargo : cliente.cargo,
            status: status || cliente.status,
            valor: valor !== undefined ? valor : cliente.valor
        });

        console.log(`✅ Cliente atualizado: ${cliente.name}`);

        res.json({
            success: true,
            message: 'Cliente atualizado com sucesso',
            data: {
                id: cliente.id,
                name: cliente.name,
                email: cliente.email,
                phone: cliente.phone,
                empresa: cliente.empresa,
                cargo: cliente.cargo,
                status: cliente.status,
                calculations: cliente.calculations,
                avatar: cliente.avatar,
                valor: cliente.valor,
                created_at: cliente.createdAt,
                updated_at: cliente.updatedAt
            }
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar cliente:', error);

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

    // DELETE /api/clientes/:id - Deletar cliente (soft delete)
    static async delete(req, res) {
    try {
        const { id } = req.params;
        console.log(`🗑️ DELETE /api/clientes/${id} - Deletando cliente...`);

        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
        }

        // Soft delete - apenas marcar como inativo
        await cliente.update({ status: 'Inativo' });

        console.log(`✅ Cliente marcado como inativo: ${cliente.name}`);

        res.json({
            success: true,
            message: 'Cliente removido com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao deletar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    // PUT /api/clientes/:id/valor - Atualizar apenas o valor do cliente
    static async updateValor(req, res) {
    try {
        const { id } = req.params;
        const { valor } = req.body;

        console.log(`💰 PUT /api/clientes/${id}/valor - Atualizando valor: R$ ${valor}`);

        if (!valor || valor <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valor deve ser maior que zero'
            });
        }

        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente não encontrado'
            });
        }

        await cliente.update({ valor });

        console.log(`✅ Valor atualizado: ${cliente.name} -> R$ ${valor}/h`);

        res.json({
            success: true,
            message: 'Valor atualizado com sucesso',
            data: {
                id: cliente.id.toString(),
                nome: cliente.name,
                valor: parseFloat(cliente.valor)
            }
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar valor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}
}

module.exports = ClientesController;