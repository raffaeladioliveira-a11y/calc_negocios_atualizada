/**
 * Created by rafaela on 24/09/25.
 */
// ==========================================
// 3. CONTROLLER - CalcValoresController
// ==========================================
// controllers/CalcValoresController.js

const CalcValores = require('../models/CalcValores');
const { validationResult } = require('express-validator');

class CalcValoresController {
    static async getConfiguracoes(req, res) {
    try {
        console.log('📊 Buscando configurações calc_valores...');

        // Buscar a configuração mais recente
        let configuracao = await CalcValores.findOne({
            order: [['id', 'DESC']]
        });

        // Se não existe, criar com valores padrão
        if (!configuracao) {
            console.log('⚠️ Nenhuma configuração encontrada, criando valores padrão...');
            configuracao = await CalcValores.create({
                valor_hora_cp: 181.82,
                valor_hora_dg: 110.00,
                valor_hora_lp: 145.45,
                valor_hora_pfb: 121.21,
                valor_hora_at: 96.97,
                valor_hora_an: 96.97,
                valor_hora_gp: 193.94,
                contingencia_valor: 135.00,
                valor_pacote_pp: 9750.00,
                valor_pacote_p: 18500.00,
                valor_pacote_m: 36000.00,
                valor_pacote_g: 51000.00,
                valor_pacote_gg: 65000.00
            });
            console.log('✅ Configuração padrão criada');
        }

        console.log('✅ Configurações encontradas:', configuracao.id);

        res.json({
            success: true,
            data: configuracao
        });

    } catch (error) {
        console.error('❌ Erro ao buscar configurações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    static async updateConfiguracoes(req, res) {
    try {
        console.log('📊 Atualizando configurações calc_valores...');
        const dados = req.body;

        // Buscar configuração existente
        let configuracao = await CalcValores.findOne({
            order: [['id', 'DESC']]
        });

        if (configuracao) {
            // Atualizar existente
            await configuracao.update(dados);
            console.log('✅ Configuração atualizada:', configuracao.id);
        } else {
            // Criar nova
            configuracao = await CalcValores.create(dados);
            console.log('✅ Nova configuração criada:', configuracao.id);
        }

        res.json({
            success: true,
            message: 'Configurações atualizadas com sucesso',
            data: configuracao
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar configurações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}

    static async resetConfiguracoes(req, res) {
    try {
        console.log('🔄 Resetando configurações para valores padrão...');

        const dadosDefault = {
            valor_hora_cp: 150.00,
            valor_hora_dg: 100.00,
            valor_hora_lp: 180.00,
            valor_hora_pfb: 120.00,
            valor_hora_at: 110.00,
            valor_hora_an: 130.00,
            valor_hora_gp: 160.00,
            contingencia_valor: 120.00,
            valor_pacote_pp: 11000.00,
            valor_pacote_p: 20000.00,
            valor_pacote_m: 38000.00,
            valor_pacote_g: 54000.00,
            valor_pacote_gg: 68000.00
        };

        let configuracao = await CalcValores.findOne({
            order: [['id', 'DESC']]
        });

        if (configuracao) {
            await configuracao.update(dadosDefault);
        } else {
            configuracao = await CalcValores.create(dadosDefault);
        }

        console.log('✅ Configurações resetadas');

        res.json({
            success: true,
            message: 'Configurações resetadas para valores padrão',
            data: configuracao
        });

    } catch (error) {
        console.error('❌ Erro ao resetar configurações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
}
}

module.exports = CalcValoresController;