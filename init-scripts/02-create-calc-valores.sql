-- ==========================================
-- 02-create-calc-valores.sql
-- Criar na pasta: init-scripts/02-create-calc-valores.sql
-- ==========================================

-- Criar tabela para configurações de valores
CREATE TABLE IF NOT EXISTS calc_valores (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Valores por hora dos profissionais
  valor_hora_cp DECIMAL(10,2) NOT NULL DEFAULT 150.00 COMMENT 'Consultor Plataforma',
  valor_hora_dg DECIMAL(10,2) NOT NULL DEFAULT 100.00 COMMENT 'Designer Gráfico',
  valor_hora_lp DECIMAL(10,2) NOT NULL DEFAULT 180.00 COMMENT 'Lead Programador',
  valor_hora_pfb DECIMAL(10,2) NOT NULL DEFAULT 120.00 COMMENT 'Programador Front/Backend',
  valor_hora_at DECIMAL(10,2) NOT NULL DEFAULT 110.00 COMMENT 'Analista Teste',
  valor_hora_an DECIMAL(10,2) NOT NULL DEFAULT 130.00 COMMENT 'Analista Negócios',
  valor_hora_gp DECIMAL(10,2) NOT NULL DEFAULT 160.00 COMMENT 'Gerente Projeto',

  -- Valor contingência/risco
  contingencia_valor DECIMAL(10,2) NOT NULL DEFAULT 120.00 COMMENT 'Valor hora contingência',

  -- Valores dos pacotes padronizados
  valor_pacote_pp DECIMAL(10,2) NOT NULL DEFAULT 11000.00 COMMENT 'Pacote PP - 50h',
  valor_pacote_p DECIMAL(10,2) NOT NULL DEFAULT 20000.00 COMMENT 'Pacote P - 100h',
  valor_pacote_m DECIMAL(10,2) NOT NULL DEFAULT 38000.00 COMMENT 'Pacote M - 200h',
  valor_pacote_g DECIMAL(10,2) NOT NULL DEFAULT 54000.00 COMMENT 'Pacote G - 300h',
  valor_pacote_gg DECIMAL(10,2) NOT NULL DEFAULT 68000.00 COMMENT 'Pacote GG - 400h',

  -- Controle de auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_by INT NULL,

  -- Índices
  INDEX idx_created_at (created_at),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados iniciais (baseados na sua tela antiga)
INSERT INTO calc_valores (
  valor_hora_cp,
  valor_hora_dg,
  valor_hora_lp,
  valor_hora_pfb,
  valor_hora_at,
  valor_hora_an,
  valor_hora_gp,
  contingencia_valor,
  valor_pacote_pp,
  valor_pacote_p,
  valor_pacote_m,
  valor_pacote_g,
  valor_pacote_gg
) VALUES (
  181.82,  -- CP
  110.00,  -- DG
  145.45,  -- LP
  121.21,  -- PFB
  96.97,   -- AT
  96.97,   -- AN
  193.94,  -- GP
  135.00,  -- Contingência
  9750.00, -- PP
  18500.00, -- P
  36000.00, -- M
  51000.00, -- G
  65000.00  -- GG
) ON DUPLICATE KEY UPDATE id=id;