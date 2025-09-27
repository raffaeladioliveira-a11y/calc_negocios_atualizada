import React, { useState, useEffect } from 'react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useClientesQuery } from '@/hooks/useClientesQuery';
import {
    Calculator,
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    Copy,
    Trash2,
    FileText,
    Calendar,
    User,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileCheck,
    Loader2,
    Download,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Interface para Cliente - compatível com o hook
interface Cliente {
  id: number;
  name?: string;
  nome?: string;
  empresa?: string;
  valor?: number;
}

// Interface para Orçamento - usando a do hook como base
interface OrcamentoDisplay {
  id?: number;
  descricao?: string;
  numero?: string;
  titulo?: string;
  cliente_id: number;
  contingencia?: '1' | '2' | '3';
  observacoes?: string;

  // Campos do hook personalizado
  cliente_nome?: string;
  cliente_email?: string;
  cliente_telefone?: string;
  status?: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado' | 'finalizado';
  valor_total?: number;
  valor_desconto?: number;
  valor_final?: number;
  total_valor_final?: number; // Compatibilidade com código antigo
  total_horas_final?: number;
  validade_dias?: number;
  data_validade?: string;
  condicoes_pagamento?: string;
  prazo_entrega?: string;
  garantia?: string;

  // Horas dos profissionais (compatibilidade)
  consultor_plataforma_horas?: number;
  designer_grafico_horas?: number;
  lead_programador_horas?: number;
  programador_front_back_horas?: number;
  analista_teste_horas?: number;
  analista_negocios_horas?: number;

  pacote_recomendado?: string;
  created_at?: string;
  updated_at?: string;
  cliente?: Cliente;
}

export default function OrcamentosPage() {
  const { toast } = useToast();

  // Estados para filtros e paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clienteFilter, setClienteFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrcamento, setSelectedOrcamento] = useState<OrcamentoDisplay | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Hook para clientes
  const { clientes: clientesData = [], loading: loadingClientes } = useClientesQuery({
    search: '',
    status: 'ativo'
  });

  // USANDO O HOOK CORRETO - com parâmetros que ele espera
  const {
      orcamentos,
      meta,
      summary,
      loading: isLoading,
      error,
      refetch,
      updateOrcamento,
      deleteOrcamento,
      duplicateOrcamento,
      changeStatus,
      fetchOrcamentos
  } = useOrcamentos({
    page: currentPage,
    limit: 12,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as any : undefined,
    cliente_id: clienteFilter && clienteFilter !== 'all' ? parseInt(clienteFilter) : undefined,
    search: searchTerm || undefined
  });

  // Log para debug - remover depois
  console.log('🔍 Debug useOrcamentos:', {
    orcamentos,
    meta,
    summary,
    loading: isLoading,
    error,
    orcamentosLength: orcamentos?.length
});

  // Estatísticas - usando summary do hook ou valores padrão
  const stats = {
    total: meta?.total || summary?.total_orcamentos || 0,
      rascunhos: summary?.por_status?.rascunho || 0,
      finalizados: summary?.por_status?.finalizado || summary?.por_status?.enviado || 0,
      aprovados: summary?.por_status?.aprovado || 0,
      rejeitados: summary?.por_status?.rejeitado || 0,
      valor_total: summary?.valor_total || 0
};

  // Funções auxiliares
  const formatarMoeda = (valor: number | string | undefined) => {
    const numeroValor = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numeroValor || 0);
  };

  const formatarHoras = (horas: number | string | undefined) => {
    const numeroHoras = typeof horas === 'string' ? parseFloat(horas) : horas;
    return (numeroHoras || 0).toFixed(2);
  };

  const formatarData = (data: string | undefined) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'rascunho': return <FileText className="w-4 h-4" />;
      case 'finalizado':
      case 'enviado': return <FileCheck className="w-4 h-4" />;
      case 'aprovado': return <CheckCircle className="w-4 h-4" />;
      case 'rejeitado': return <XCircle className="w-4 h-4" />;
      case 'expirado': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'rascunho': return 'bg-slate-100 text-slate-800';
      case 'finalizado':
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'expirado': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContingenciaLabel = (contingencia: string | undefined) => {
    switch (contingencia) {
      case '1': return 'Baixa (10%)';
      case '2': return 'Média (20%)';
      case '3': return 'Alta (30%)';
      default: return 'N/A';
    }
  };

  // Função para atualizar status - usando o hook correto
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await changeStatus(id, newStatus as any);
      await refetch();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDuplicate = async (orcamento: OrcamentoDisplay) => {
    if (!orcamento.id) return;

    try {
      await duplicateOrcamento(orcamento.id);
      await refetch();
    } catch (error) {
      toast({
        title: "Erro ao duplicar",
        description: "Não foi possível duplicar o orçamento",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (orcamento: OrcamentoDisplay) => {
    if (!orcamento.id) return;

    try {
      const success = await deleteOrcamento(orcamento.id);
      if (success) {
        await refetch();
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o orçamento",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Exportar Relatório",
      description: "Relatório exportado com sucesso!",
    });
  };

  // Filtrar orçamentos pelo termo de busca (se não estiver sendo feito no backend)
  const filteredOrcamentos = Array.isArray(orcamentos) ? orcamentos.filter(orcamento => {
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      const descricao = orcamento.descricao || orcamento.titulo || '';
      const clienteNome = orcamento.cliente_nome || '';
      return descricao.toLowerCase().includes(termo) ||
          clienteNome.toLowerCase().includes(termo);
    }
    return true;
  }) : [];

  // Valor para exibição - compatibilidade com ambos os formatos
  const getValorDisplay = (orcamento: OrcamentoDisplay) => {
    const valor = orcamento.valor_final || orcamento.total_valor_final || orcamento.valor_total || 0;
    return typeof valor === 'string' ? parseFloat(valor) : valor;
  };

  const getDescricaoDisplay = (orcamento: OrcamentoDisplay) => {
    return orcamento.descricao || orcamento.titulo || 'Sem descrição';
  };

  const getClienteNomeDisplay = (orcamento: OrcamentoDisplay) => {
    return orcamento.cliente_nome || orcamento.cliente?.name || orcamento.cliente?.nome || 'Cliente não encontrado';
  };

  // useEffect para busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        fetchOrcamentos({ page: 1, search: searchTerm });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchOrcamentos]);

  if (isLoading && !orcamentos.length) {
    return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Carregando orçamentos...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center p-8">
          <p className="text-destructive mb-4">Erro ao carregar orçamentos: {error}</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orçamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os orçamentos do sistema
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button className="gradient-primary shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <Card className="glass-card border-glass-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calculator className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aprovados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.aprovados}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Finalizados</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.finalizados}</p>
                </div>
                <FileCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rascunhos</p>
                  <p className="text-2xl font-bold text-slate-600">{stats.rascunhos}</p>
                </div>
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-lg font-bold text-success">{formatarMoeda(stats.valor_total)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="glass-card border-glass-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Buscar orçamentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-card border-glass-border"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
              fetchOrcamentos({
                page: 1,
                status: value !== 'all' ? value as any : undefined
              });
            }}>
                <SelectTrigger className="glass-card border-glass-border">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="expirado">Expirado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={clienteFilter} onValueChange={(value) => {
              setClienteFilter(value);
              setCurrentPage(1);
              fetchOrcamentos({
                page: 1,
                cliente_id: value !== 'all' ? parseInt(value) : undefined
              });
            }}>
                <SelectTrigger className="glass-card border-glass-border">
                  <SelectValue placeholder="Filtrar por Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clientesData.map((cliente: any) => (
                      <SelectItem key={cliente.id} value={String(cliente.id)}>
                        {cliente.nome || cliente.name || 'Cliente'}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="flex-1"
                >
                  Cards
                </Button>
                <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex-1"
                >
                  Tabela
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info - Remover em produção */}
        <Card className="glass-card border-glass-border bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm">
              <strong>Debug:</strong> {filteredOrcamentos.length} orçamentos carregados |
            Loading: {isLoading ? 'Sim' : 'Não'} |
            Error: {error || 'Nenhum'}
            </p>
          </CardContent>
        </Card>

        {/* Lista de Orçamentos */}
        {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrcamentos.map((orcamento) => (
                  <Card key={orcamento.id} className="glass-card border-glass-border hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{getDescricaoDisplay(orcamento)}</CardTitle>
                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4 mr-1" />
                            {getClienteNomeDisplay(orcamento)}
                          </div>
                        </div>
                        <Badge className={getStatusColor(orcamento.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(orcamento.status)}
                      {orcamento.status}
                    </span>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Número:</span>
                          <div className="font-semibold">{orcamento.numero || `#${orcamento.id}`}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor:</span>
                          <div className="font-semibold text-success">{formatarMoeda(getValorDisplay(orcamento))}</div>
                        </div>
                        {orcamento.total_horas_final && (
                            <div>
                              <span className="text-muted-foreground">Horas:</span>
                              <div className="font-semibold">{formatarHoras(orcamento.total_horas_final)}h</div>
                            </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Pacote:</span>
                          <div className="font-semibold">{orcamento.pacote_recomendado || 'Personalizado'}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatarData(orcamento.created_at)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrcamento(orcamento)}
                            className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicate(orcamento)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(orcamento)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        ) : (
            <Card className="glass-card border-glass-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-glass-border">
                    <tr>
                      <th className="text-left p-4">Descrição</th>
                      <th className="text-left p-4">Cliente</th>
                      <th className="text-center p-4">Status</th>
                      <th className="text-center p-4">Valor</th>
                      <th className="text-center p-4">Data</th>
                      <th className="text-center p-4">Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOrcamentos.map((orcamento) => (
                        <tr key={orcamento.id} className="border-b border-glass-border hover:bg-glass-hover">
                          <td className="p-4">
                            <div className="font-medium">{getDescricaoDisplay(orcamento)}</div>
                            <div className="text-sm text-muted-foreground">
                              {orcamento.numero || `#${orcamento.id}`}
                            </div>
                          </td>
                          <td className="p-4">{getClienteNomeDisplay(orcamento)}</td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <Badge className={getStatusColor(orcamento.status)}>
                                {orcamento.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="text-center p-4 font-semibold text-success">
                            {formatarMoeda(getValorDisplay(orcamento))}
                          </td>
                          <td className="text-center p-4">{formatarData(orcamento.created_at)}</td>
                          <td className="p-4">
                            <div className="flex justify-center gap-1">
                              <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedOrcamento(orcamento)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDuplicate(orcamento)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(orcamento)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Paginação */}
        {meta && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredOrcamentos.length} de {meta.total} orçamentos
              </p>
              <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);
                fetchOrcamentos({ page: newPage });
              }}
                    disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 py-2 text-sm">
              {meta.current_page} de {meta.last_page}
            </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                fetchOrcamentos({ page: newPage });
              }}
                    disabled={currentPage >= meta.last_page}
                >
                  Próximo
                </Button>
              </div>
            </div>
        )}

        {/* Modal de Detalhes */}
        <Dialog open={!!selectedOrcamento} onOpenChange={() => setSelectedOrcamento(null)}>
          <DialogContent className="max-w-4xl glass-card border-glass-border">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Detalhes do Orçamento</span>
                {selectedOrcamento && (
                    <Badge className={getStatusColor(selectedOrcamento.status)}>
                      {selectedOrcamento.status}
                    </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedOrcamento && getDescricaoDisplay(selectedOrcamento)}
              </DialogDescription>
            </DialogHeader>

            {selectedOrcamento && (
                <div className="space-y-6">
                  <Tabs defaultValue="detalhes" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                      <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
                      <TabsTrigger value="status">Status</TabsTrigger>
                    </TabsList>

                    <TabsContent value="detalhes" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Cliente:</span>
                          <div className="font-semibold">{getClienteNomeDisplay(selectedOrcamento)}</div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Número:</span>
                          <div className="font-semibold">{selectedOrcamento.numero || `#${selectedOrcamento.id}`}</div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Valor Total:</span>
                          <div className="font-semibold text-success">{formatarMoeda(getValorDisplay(selectedOrcamento))}</div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Data de Criação:</span>
                          <div className="font-semibold">{formatarData(selectedOrcamento.created_at)}</div>
                        </div>
                      </div>

                      {selectedOrcamento.observacoes && (
                          <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Observações:</span>
                            <div className="p-3 glass-card border-glass-border rounded">
                              {selectedOrcamento.observacoes}
                            </div>
                          </div>
                      )}
                    </TabsContent>

                    <TabsContent value="profissionais" className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b">
                          <tr>
                            <th className="text-left p-2">Profissional</th>
                            <th className="text-center p-2">Horas</th>
                          </tr>
                          </thead>
                          <tbody>
                          {selectedOrcamento.consultor_plataforma_horas && (
                              <tr className="border-b">
                                <td className="p-2">Consultor de Plataforma</td>
                                <td className="text-center p-2">{selectedOrcamento.consultor_plataforma_horas}h</td>
                              </tr>
                          )}
                          {selectedOrcamento.designer_grafico_horas && (
                              <tr className="border-b">
                                <td className="p-2">Designer Gráfico</td>
                                <td className="text-center p-2">{selectedOrcamento.designer_grafico_horas}h</td>
                              </tr>
                          )}
                          {selectedOrcamento.lead_programador_horas && (
                              <tr className="border-b">
                                <td className="p-2">Lead Programador</td>
                                <td className="text-center p-2">{selectedOrcamento.lead_programador_horas}h</td>
                              </tr>
                          )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    <TabsContent value="status" className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {['rascunho', 'enviado', 'finalizado', 'aprovado', 'rejeitado'].map((status) => (
                            <Button
                                key={status}
                                variant={selectedOrcamento.status === status ? 'default' : 'outline'}
                                onClick={() => selectedOrcamento.id && handleUpdateStatus(selectedOrcamento.id, status)}
                                className="justify-start"
                            >
                              {getStatusIcon(status)}
                              <span className="ml-2 capitalize">{status}</span>
                            </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" onClick={() => handleDuplicate(selectedOrcamento)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(selectedOrcamento)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Estado vazio */}
        {filteredOrcamentos.length === 0 && !isLoading && (
            <Card className="glass-card border-glass-border">
              <CardContent className="text-center py-12">
                <Calculator className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || (statusFilter && statusFilter !== 'all') || (clienteFilter && clienteFilter !== 'all')
                      ? 'Tente ajustar os filtros ou criar um novo orçamento.'
                      : 'Comece criando seu primeiro orçamento.'}
                </p>
                <Button className="gradient-primary shadow-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Orçamento
                </Button>
              </CardContent>
            </Card>
        )}
      </div>
  );
}