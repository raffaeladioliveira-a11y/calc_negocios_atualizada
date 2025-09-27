import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clientesApi, orcamentosApi } from "@/services/api";
import { Users, FileText, Calculator, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  // Fetch statistics
  const { data: clienteStats, isLoading: loadingClientes } = useQuery({
    queryKey: ['cliente-stats'],
    queryFn: clientesApi.getStats,
  });

  const { data: orcamentoStats, isLoading: loadingOrcamentos } = useQuery({
    queryKey: ['orcamento-stats'],
    queryFn: orcamentosApi.getStats,
  });

  const { data: clientes, isLoading: loadingClientesList } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.getAll(),
  });

  const { data: orcamentos, isLoading: loadingOrcamentosList } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: orcamentosApi.getAll,
  });

  // Calculate recent activity
  const recentClientes = Array.isArray(clientes) ? clientes.slice(0, 5) : [];
  const recentOrcamentos = Array.isArray(orcamentos?.orcamentos) ? orcamentos.orcamentos.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu sistema de gestão de negócios
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Clients */}
        <Card className="business-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingClientes ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="metric-value">
                {clienteStats?.total || 0}
              </div>
            )}
            <p className="metric-label mt-1">
              {loadingClientes ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <>
                  <span className="text-accent">{clienteStats?.ativos || 0}</span> ativos
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Total Orçamentos */}
        <Card className="business-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orçamentos</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <FileText className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingOrcamentos ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="metric-value">
                {orcamentoStats?.total || 0}
              </div>
            )}
            <p className="metric-label mt-1">
              {loadingOrcamentos ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <>
                  <span className="text-yellow-400">{orcamentoStats?.pendentes || 0}</span> pendentes
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Valor Total */}
        <Card className="business-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingOrcamentos ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-accent">
                R$ {(orcamentoStats?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
            <p className="metric-label mt-1">
              Em orçamentos
            </p>
          </CardContent>
        </Card>

        {/* Média de Cálculos */}
        <Card className="business-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média de Cálculos</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingClientes ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="metric-value">
                {(clienteStats?.media_calculos || 0).toFixed(1)}
              </div>
            )}
            <p className="metric-label mt-1">
              Por cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Clients */}
        <Card className="business-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes Recentes
            </CardTitle>
            <CardDescription>
              Últimos clientes cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingClientesList ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentClientes.length > 0 ? (
              <div className="space-y-3">
                {recentClientes.map((cliente) => (
                  <div key={cliente.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/5 transition-colors border border-border/30">
                    <div className="h-10 w-10 rounded-full avatar-gradient flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {cliente.avatar || cliente.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {cliente.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {cliente.empresa || cliente.email}
                      </p>
                    </div>
                    <Badge
                      variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}
                      className={cliente.status === 'Ativo' ? 'status-active' : 'status-inactive'}
                    >
                      {cliente.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum cliente encontrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orçamentos */}
        <Card className="business-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Orçamentos Recentes
            </CardTitle>
            <CardDescription>
              Últimos orçamentos criados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrcamentosList ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentOrcamentos.length > 0 ? (
              <div className="space-y-3">
                {recentOrcamentos.map((orcamento) => (
                  <div key={orcamento.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/5 transition-colors border border-border/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {orcamento.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        R$ {typeof orcamento.valor_total === 'number'
                          ? orcamento.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                          : '0,00'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        orcamento.status === 'Aprovado' ? 'default' :
                        orcamento.status === 'Pendente' ? 'secondary' :
                        orcamento.status === 'Em Andamento' ? 'outline' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {orcamento.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum orçamento encontrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}