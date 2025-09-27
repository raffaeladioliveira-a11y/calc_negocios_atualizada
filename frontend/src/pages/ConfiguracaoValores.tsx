/**
 * Created by rafaela on 27/09/25.
 */
import { useState, useEffect } from "react";
import { useConfiguracoes, useUpdateConfiguracoes } from "@/hooks/useCalcValores";
import { Settings, DollarSign, Package, RotateCcw, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiService, CalcValores } from "@/services/calcValoresService";

export default function ConfiguracaoValores() {
    const { toast } = useToast();
    const { data: configuracoes, isLoading } = useConfiguracoes();
    const updateMutation = useUpdateConfiguracoes();

    // Estados para o formulário
    const [formData, setFormData] = useState<Partial<CalcValores>>({});
    const [isResetting, setIsResetting] = useState(false);

    // Inicializar form com dados carregados
    useEffect(() => {
        if (configuracoes) {
            setFormData(configuracoes);
        }
    }, [configuracoes]);

    const handleInputChange = (field: keyof CalcValores, value: string) => {
        const numValue = parseFloat(value) || 0;
        setFormData(prev => ({ ...prev, [field]: numValue }));
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(formData);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    };

    const handleReset = async () => {
        try {
            setIsResetting(true);
            await apiService.resetConfiguracoes();

            toast({
                title: "Valores resetados!",
                description: "Configurações restauradas para valores padrão",
            });

            // Recarregar dados
            window.location.reload();

        } catch (error) {
            console.error('Erro ao resetar:', error);
            toast({
                title: "Erro!",
                description: "Falha ao resetar configurações",
                variant: "destructive",
            });
        } finally {
            setIsResetting(false);
        }
    };

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Carregando configurações...</span>
            </div>
        );
    }

    // Error state
    if (!configuracoes && !isLoading) {
        return (
            <div className="text-center p-8">
                <p className="text-destructive mb-4">Erro ao carregar configurações</p>
                <Button onClick={() => window.location.reload()}>
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
                    <h1 className="text-3xl font-bold mb-2">Configuração de Valores</h1>
                    <p className="text-muted-foreground">
                        Gerencie os valores por hora e pacotes da calculadora
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={isResetting}
                    >
                        {isResetting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <RotateCcw className="w-4 h-4 mr-2" />
                        )}
                        Resetar Padrão
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="gradient-primary shadow-primary"
                    >
                        {updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Valores por Hora dos Profissionais */}
                <Card className="glass-card border-glass-border">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <DollarSign className="mr-2 w-5 h-5" />
                            Valores por Hora - Profissionais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { key: 'valor_hora_cp', label: 'Consultor de Plataformas', desc: 'CP' },
                                { key: 'valor_hora_dg', label: 'Designer Gráfico', desc: 'DG' },
                                { key: 'valor_hora_lp', label: 'Lead Programador', desc: 'LP' },
                                { key: 'valor_hora_pfb', label: 'Programador Front/Backend', desc: 'PFB' },
                                { key: 'valor_hora_at', label: 'Analista de Teste', desc: 'AT' },
                                { key: 'valor_hora_an', label: 'Analista de Negócios', desc: 'AN' },
                                { key: 'valor_hora_gp', label: 'Gerente de Projeto', desc: 'GP' }
                            ].map((item) => (
                                <div key={item.key} className="space-y-2">
                                    <Label htmlFor={item.key}>
                                        {item.label} ({item.desc})
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                                            <Input
                                                id={item.key}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={formData[item.key as keyof CalcValores] || ''}
                        onChange={(e) => handleInputChange(item.key as keyof CalcValores, e.target.value)}
                        className="glass-card border-glass-border pl-10"
                      />
                                        </div>
                                        <div className="text-sm text-muted-foreground min-w-[100px]">
                                            {formData[item.key as keyof CalcValores] ?
                        formatarMoeda(formData[item.key as keyof CalcValores] as number) :
                        'R$ 0,00'
                      }/h
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* Contingência */}
                        <div className="space-y-2">
                            <Label htmlFor="contingencia_valor">
                                Valor Hora Contingência/Risco
                            </Label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                                    <Input
                                        id="contingencia_valor"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.contingencia_valor || ''}
                                        onChange={(e) => handleInputChange('contingencia_valor', e.target.value)}
                                        className="glass-card border-glass-border pl-10"
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground min-w-[100px]">
                                    {formData.contingencia_valor ?
                                        formatarMoeda(formData.contingencia_valor) :
                                        'R$ 0,00'
                                    }/h
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Usado para calcular horas de contingência (10%, 20% ou 30%)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Valores dos Pacotes */}
                <Card className="glass-card border-glass-border">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="mr-2 w-5 h-5" />
                            Valores dos Pacotes Padronizados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { key: 'valor_pacote_pp', label: 'Pacote PP', desc: '50 horas' },
                                { key: 'valor_pacote_p', label: 'Pacote P', desc: '100 horas' },
                                { key: 'valor_pacote_m', label: 'Pacote M', desc: '200 horas' },
                                { key: 'valor_pacote_g', label: 'Pacote G', desc: '300 horas' },
                                { key: 'valor_pacote_gg', label: 'Pacote GG', desc: '400 horas' }
                            ].map((item) => (
                                <div key={item.key} className="space-y-2">
                                    <Label htmlFor={item.key}>
                                        {item.label} ({item.desc})
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                                            <Input
                                                id={item.key}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={formData[item.key as keyof CalcValores] || ''}
                        onChange={(e) => handleInputChange(item.key as keyof CalcValores, e.target.value)}
                        className="glass-card border-glass-border pl-10"
                      />
                                        </div>
                                        <div className="text-sm text-muted-foreground min-w-[120px]">
                                            {formData[item.key as keyof CalcValores] ?
                        formatarMoeda(formData[item.key as keyof CalcValores] as number) :
                        'R$ 0,00'
                      }
                                        </div>
                                    </div>
                                    {formData[item.key as keyof CalcValores] && (
                                    <div className="text-xs text-muted-foreground">
                                        {formatarMoeda((formData[item.key as keyof CalcValores] as number) /
                        parseInt(item.desc.split(' ')[0]))} por hora
                                    </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Resumo das Alterações */}
            {configuracoes && JSON.stringify(formData) !== JSON.stringify(configuracoes) && (
                <Card className="glass-card border-glass-border border-warning/50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-warning">
                            <Settings className="mr-2 w-5 h-5" />
                            Alterações Pendentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFormData(configuracoes)}
                            >
                                Descartar Alterações
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="gradient-primary shadow-primary"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Salvar Agora
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Informações de Debug */}
            <Card className="glass-card border-glass-border">
                <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                        <Settings className="mr-2 w-4 h-4" />
                        Informações do Sistema
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <div>ID da Configuração: {configuracoes?.id || 'N/A'}</div>
                        <div>Última Atualização: {configuracoes ? new Date().toLocaleString('pt-BR') : 'N/A'}</div>
                        <div>Status da API: {isLoading ? 'Carregando...' : 'Conectada'}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}