/**
 * Created by rafaela on 24/09/25.
 */
const { body } = require('express-validator');

const calcValoresValidator = [
    // Valores por hora dos profissionais
    body('valor_hora_cp')
        .isFloat({ min: 0.01 })
        .withMessage('Valor hora CP deve ser um número positivo'),

    body('valor_hora_dg')
        .isFloat({ min: 0.01 })
        .withMessage('Valor hora DG deve ser um número positivo'),

    body('valor_hora_lp')
        .isFloat({ min: 0.01 })
        .withMessage('Valor hora LP deve ser um número positivo'),

    body('valor_hora_pfb')
        .isFloat({ min: 0.01 })
        .withMessage('Valor hora PFB deve ser um número positivo'),

    body('valor_hora_at')
        .isFloat({ min: 0.01 })
        .withMessage('Valor hora AT deve ser um número positivo'),

    body('valor_hora_an')
        .isFloat({ min: 0.01 })
        .withMessage('Valor hora AN deve ser um número positivo'),

    body('valor_hora_gp')
        .isFloat({ min: 0.01 })
        .withMessage('Valor hora GP deve ser um número positivo'),

    body('contingencia_valor')
        .isFloat({ min: 0.01 })
        .withMessage('Valor contingência deve ser um número positivo'),

    // Valores dos pacotes
    body('valor_pacote_pp')
        .isFloat({ min: 0.01 })
        .withMessage('Valor pacote PP deve ser um número positivo'),

    body('valor_pacote_p')
        .isFloat({ min: 0.01 })
        .withMessage('Valor pacote P deve ser um número positivo'),

    body('valor_pacote_m')
        .isFloat({ min: 0.01 })
        .withMessage('Valor pacote M deve ser um número positivo'),

    body('valor_pacote_g')
        .isFloat({ min: 0.01 })
        .withMessage('Valor pacote G deve ser um número positivo'),

    body('valor_pacote_gg')
        .isFloat({ min: 0.01 })
        .withMessage('Valor pacote GG deve ser um número positivo')
];

module.exports = {
    calcValoresValidator
};