import { FileText, Download, Filter, Calendar, BarChart3, PieChart, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Relatorios() {
  const relatorios = [
    {
      id: 1,
      title: "Análise ROI - Tech Solutions",
      description: "Relatório completo de ROI e viabilidade financeira",
      empresa: "Tech Solutions LTDA",
      tipo: "ROI",
      status: "Concluído",
      data: "2024-01-15",
      valor: "R$ 150.000",
      icone: TrendingUp,
      color: "success"
    },
    {
      id: 2,
      title: "Projeção Financeira - Digital Commerce",
      description: "Projeção de 12 meses com análise de cenários",
      empresa: "Digital Commerce",
      tipo: "Projeção",
      status: "Em andamento",
      data: "2024-01-14",
      valor: "R$ 85.000",
      icone: BarChart3,
      color: "warning"
    },
    {
      id: 3,
      title: "Análise de Custos - Startup Innovation",
      description: "Breakdown detalhado de custos operacionais",
      empresa: "Startup Innovation",
      tipo: "Custos",
      status: "Concluído",
      data: "2024-01-13",
      valor: "R$ 320.000",
      icone: PieChart,
      color: "success"
    },
    {
      id: 4,
      title: "Payback Analysis - Enterprise Corp",
      description: "Análise de payback para novos investimentos",
      empresa: "Enterprise Corp",
      tipo: "Payback",
      status: "Revisão",
      data: "2024-01-12",
      valor: "R$ 95.000",
      icone: TrendingUp,
      color: "destructive"
    }
  ];

  const estatisticas = [
    { label: "Total de Relatórios", valor: "47", icone: FileText },
    { label: "Concluídos", valor: "35", icone: TrendingUp },
    { label: "Em andamento", valor: "8", icone: BarChart3 },
    { label: "Valor Total", valor: "R$ 2.3M", icone: PieChart }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-success/20 text-success";
      case "Em andamento":
        return "bg-warning/20 text-warning";
      case "Revisão":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os relatórios financeiros
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-button">
            <Filter className="mr-2 w-4 h-4" />
            Filtros
          </Button>
          <Button className="gradient-primary shadow-primary">
            <Download className="mr-2 w-4 h-4" />
            Exportar Todos
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-glass-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger className="glass-card border-glass-border">
                <SelectValue placeholder="Tipo de Relatório" />
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border">
                <SelectItem value="roi">ROI</SelectItem>
                <SelectItem value="projecao">Projeção</SelectItem>
                <SelectItem value="custos">Custos</SelectItem>
                <SelectItem value="payback">Payback</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="glass-card border-glass-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border">
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="andamento">Em andamento</SelectItem>
                <SelectItem value="revisao">Revisão</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="glass-card border-glass-border">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border">
                <SelectItem value="tech-solutions">Tech Solutions</SelectItem>
                <SelectItem value="digital-commerce">Digital Commerce</SelectItem>
                <SelectItem value="startup">Startup Innovation</SelectItem>
                <SelectItem value="enterprise">Enterprise Corp</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="glass-button">
              <Calendar className="mr-2 w-4 h-4" />
              Período
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {estatisticas.map((stat, index) => (
          <Card key={index} className="glass-card border-glass-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.valor}</p>
                </div>
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                  <stat.icone className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Relatórios */}
      <div className="grid grid-cols-1 gap-4">
        {relatorios.map((relatorio) => {
          const IconeRelatorio = relatorio.icone;
          return (
            <Card key={relatorio.id} className="glass-card border-glass-border hover:shadow-primary transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                      <IconeRelatorio className="w-6 h-6 text-primary-foreground" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{relatorio.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(relatorio.status)}>
                            {relatorio.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{relatorio.data}</span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground">{relatorio.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-muted-foreground">Empresa:</span>
                          <span className="font-medium">{relatorio.empresa}</span>
                          <span className="text-muted-foreground">Tipo:</span>
                          <Badge variant="outline">{relatorio.tipo}</Badge>
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-semibold text-success">{relatorio.valor}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="glass-button">
                            <Eye className="mr-1 w-3 h-3" />
                            Visualizar
                          </Button>
                          <Button variant="outline" size="sm" className="glass-button">
                            <Download className="mr-1 w-3 h-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações em Massa */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle>Ações em Massa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="glass-button">
              <Download className="mr-2 w-4 h-4" />
              Baixar Todos (ZIP)
            </Button>
            <Button variant="outline" className="glass-button">
              <FileText className="mr-2 w-4 h-4" />
              Gerar Relatório Consolidado
            </Button>
            <Button variant="outline" className="glass-button">
              <Calendar className="mr-2 w-4 h-4" />
              Agendar Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}