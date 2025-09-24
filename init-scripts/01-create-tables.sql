-- Script de inicialização do banco de dados
-- Este arquivo será executado automaticamente quando o container MySQL for criado pela primeira vez

-- Usar o banco de dados correto
USE meu_projeto_db;

-- Configurações de charset
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Remover tabelas se existirem (para reinicialização limpa)
DROP TABLE IF EXISTS calculos;
DROP TABLE IF EXISTS clientes;

-- Tabela de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NULL,
    empresa VARCHAR(255) NULL,
    cargo VARCHAR(255) NULL,
    status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
    calculations INT DEFAULT 0,
    avatar VARCHAR(10) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity DATE NULL,

    INDEX idx_email (email),
    INDEX idx_empresa (empresa),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de cálculos (para rastrear os cálculos dos clientes)
CREATE TABLE calculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    resultado DECIMAL(15,4) NULL,
    tipo VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados de exemplo dos clientes
INSERT INTO clientes (name, email, phone, empresa, cargo, status, calculations, avatar, last_activity) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-8888', 'Tech Solutions LTDA', 'CEO', 'Ativo', 15, 'JS', '2024-01-15'),
('Maria Santos', 'maria.santos@digitalcommerce.com', '(11) 88888-7777', 'Digital Commerce', 'CFO', 'Ativo', 12, 'MS', '2024-01-14'),
('Pedro Oliveira', 'pedro@startup.io', '(11) 77777-6666', 'Startup Innovation', 'CTO', 'Ativo', 8, 'PO', '2024-01-13'),
('Ana Costa', 'ana.costa@enterprise.com', '(11) 66666-5555', 'Enterprise Corp', 'Diretora', 'Inativo', 5, 'AC', '2024-01-08');

-- Inserir alguns cálculos de exemplo
INSERT INTO calculos (cliente_id, titulo, descricao, resultado, tipo) VALUES
(1, 'Cálculo ROI Q1', 'Retorno sobre investimento primeiro trimestre', 15.75, 'ROI'),
(1, 'Análise Break-even', 'Ponto de equilíbrio produto A', 25000.00, 'BREAK_EVEN'),
(2, 'Margem de Lucro', 'Margem bruta produto principal', 45.30, 'MARGEM'),
(2, 'Fluxo de Caixa', 'Projeção 6 meses', 150000.00, 'FLUXO_CAIXA'),
(3, 'Valuation Startup', 'Avaliação da empresa', 2500000.00, 'VALUATION');

-- Verificar se os dados foram inseridos
SELECT 'Clientes inseridos:' as info, COUNT(*) as total FROM clientes;
SELECT 'Cálculos inseridos:' as info, COUNT(*) as total FROM calculos;