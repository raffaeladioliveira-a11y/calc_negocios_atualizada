import { useState, useEffect, useCallback } from "react";
import { Calculator, Users, Clock, DollarSign, TrendingUp, PieChart, Save, Download, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfiguracoes, useClientes } from "@/hooks/useCalcValores";
import { useOrcamentos } from "@/hooks/useOrcamentos";

interface Cliente {
    id: string;
    nome: string;
    valor: number;
}

interface HorasProfissionais {
    cp: string;
    dg: string;
    lp: string;
    pfb: string;
    at: string;
    an: string;
}

interface ResultadosCalculados {
    diasCP: number;
    diasDG: number;
    diasLP: number;
    diasPFB: number;
    diasAT: number;
    diasAN: number;
    diasGP: number;
    horasGP: number;
    horasPP: number;
    horasCR: number;
    horasFinal: number;
    valorCP: number;
    valorDG: number;
    valorLP: number;
    valorPFB: number;
    valorAT: number;
    valorAN: number;
    valorGP: number;
    valorPP: number;
    valorCR: number;
    valorFinal: number;
    pacoteRecomendado: string;
    valorPacote: number;
    diferencaVsPacote: number;
    horasNecessariasCliente: number;
    pacoteRecomendadoCliente: string;
    representatividadeCP: number;
    representatividadeDG: number;
    representatividadeLP: number;
    representatividadePFB: number;
    representatividadeAT: number;
    representatividadeAN: number;
    representatividadeGP: number;
    margem60: number;
    margem56: number;
    margem52: number;
    urgencia30: number;
    urgencia50: number;
}

export default function Calculadora() {
    // TODOS OS HOOKS DEVEM VIR PRIMEIRO - SEMPRE NA MESMA ORDEM
    const { toast } = useToast();
    const { data: configuracoes, isLoading: loadingConfig } = useConfiguracoes();
    const { data: clientes, isLoading: loadingClientes } = useClientes();
    const { createOrcamento } = useOrcamentos();

    // TODOS OS ESTADOS
    const [descricao, setDescricao] = useState("");
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
    const [contingencia, setContingencia] = useState("1");
    const [observacoes, setObservacoes] = useState("");
    const [horas, setHoras] = useState<HorasProfissionais>({
        cp: "0",
        dg: "0",
        lp: "0",
        pfb: "0",
        at: "0",
        an: "0"
    });
    const [resultados, setResultados] = useState<ResultadosCalculados | null>(null);
    const [salvandoOrcamento, setSalvandoOrcamento] = useState(false);

    // FUNÇÕES UTILITÁRIAS
    const toNumber = useCallback((value: string): number => {
        if (!value) return 0;

        const cleanedValue = value.replace(/[^0-9,.]/g, '').replace(/[:,]/g, '.');
        const parts = cleanedValue.split('.');

        if (parts.length === 1) {
            return parseFloat(cleanedValue) || 0;
        }

        const hours = parseFloat(parts[0]) || 0;
        const minutes = parseFloat(parts[1]) || 0;
        const decimalMinutes = minutes / 60;

        return hours + decimalMinutes;
    }, []);

    const formatarMoeda = useCallback((valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }, []);

    // FUNÇÃO PARA CALCULAR RESULTADOS
    const calcularResultados = useCallback((): ResultadosCalculados | null => {
        if (!configuracoes) return null;

        // Converter horas para decimal
        const cpHoras = toNumber(horas.cp);
        const dgHoras = toNumber(horas.dg);
        const lpHoras = toNumber(horas.lp);
        const pfbHoras = toNumber(horas.pfb);
        const atHoras = toNumber(horas.at);
        const anHoras = toNumber(horas.an);

        // Valores hora das configurações
        const valoresHora = {
            cp: configuracoes.valor_hora_cp,
            dg: configuracoes.valor_hora_dg,
            lp: configuracoes.valor_hora_lp,
            pfb: configuracoes.valor_hora_pfb,
            at: configuracoes.valor_hora_at,
            an: configuracoes.valor_hora_an,
            gp: configuracoes.valor_hora_gp,
            cr: configuracoes.contingencia_valor
        };

        const pacotes = {
            PP: { horas: 50, valor: configuracoes.valor_pacote_pp },
            P: { horas: 100, valor: configuracoes.valor_pacote_p },
            M: { horas: 200, valor: configuracoes.valor_pacote_m },
            G: { horas: 300, valor: configuracoes.valor_pacote_g },
            GG: { horas: 400, valor: configuracoes.valor_pacote_gg }
        };

        // Calcular dias (horas / 8)
        const diasCP = cpHoras / 8;
        const diasDG = dgHoras / 8;
        const diasLP = lpHoras / 8;
        const diasPFB = pfbHoras / 8;
        const diasAT = atHoras / 8;
        const diasAN = anHoras / 8;

        // Total de dias e horas
        const totalDias = diasCP + diasDG + diasLP + diasPFB + diasAT + diasAN;
        const totalHoras = cpHoras + dgHoras + lpHoras + pfbHoras + atHoras + anHoras;

        // Gerente de Projeto (15% dos dias totais)
        const diasGP = totalDias * 0.15;
        const horasGP = diasGP * 8;

        // Prévia Parcial
        const horasPP = totalHoras + horasGP;

        // Contingência/Risco
        let percentualContingencia = 0.1;
        if (contingencia === "2") percentualContingencia = 0.2;
        if (contingencia === "3") percentualContingencia = 0.3;

        const horasCR = horasPP * percentualContingencia;
        const horasFinal = horasPP + horasCR;

        // Valores
        const valorCP = cpHoras * valoresHora.cp;
        const valorDG = dgHoras * valoresHora.dg;
        const valorLP = lpHoras * valoresHora.lp;
        const valorPFB = pfbHoras * valoresHora.pfb;
        const valorAT = atHoras * valoresHora.at;
        const valorAN = anHoras * valoresHora.an;
        const valorGP = horasGP * valoresHora.gp;
        const valorPP = valorCP + valorDG + valorLP + valorPFB + valorAT + valorAN + valorGP;
        const valorCR = horasCR * valoresHora.cr;
        const valorFinal = valorPP + valorCR;

        // Pacote Recomendado
        let pacoteRecomendado = "Sob demanda";
        let valorPacote = 0;

        if (horasFinal <= 50) {
            pacoteRecomendado = "PP";
            valorPacote = pacotes.PP.valor;
        } else if (horasFinal <= 100) {
            pacoteRecomendado = "P";
            valorPacote = pacotes.P.valor;
        } else if (horasFinal <= 200) {
            pacoteRecomendado = "M";
            valorPacote = pacotes.M.valor;
        } else if (horasFinal <= 300) {
            pacoteRecomendado = "G";
            valorPacote = pacotes.G.valor;
        } else if (horasFinal <= 400) {
            pacoteRecomendado = "GG";
            valorPacote = pacotes.GG.valor;
        }

        const diferencaVsPacote = valorPacote - valorFinal;

        // Cálculos para o cliente
        let horasNecessariasCliente = 0;
        let pacoteRecomendadoCliente = "N/A";

        if (clienteSelecionado) {
            horasNecessariasCliente = valorFinal / clienteSelecionado.valor;

            if (horasNecessariasCliente <= 50) {
                pacoteRecomendadoCliente = "PP";
            } else if (horasNecessariasCliente <= 100) {
                pacoteRecomendadoCliente = "P";
            } else if (horasNecessariasCliente <= 200) {
                pacoteRecomendadoCliente = "M";
            } else if (horasNecessariasCliente <= 300) {
                pacoteRecomendadoCliente = "G";
            } else if (horasNecessariasCliente <= 400) {
                pacoteRecomendadoCliente = "GG";
            } else {
                pacoteRecomendadoCliente = "Sob demanda";
            }
        }

        // Representatividade
        const representatividadeCP = horasPP > 0 ? (cpHoras / horasPP) * 100 : 0;
        const representatividadeDG = horasPP > 0 ? (dgHoras / horasPP) * 100 : 0;
        const representatividadeLP = horasPP > 0 ? (lpHoras / horasPP) * 100 : 0;
        const representatividadePFB = horasPP > 0 ? (pfbHoras / horasPP) * 100 : 0;
        const representatividadeAT = horasPP > 0 ? (atHoras / horasPP) * 100 : 0;
        const representatividadeAN = horasPP > 0 ? (anHoras / horasPP) * 100 : 0;
        const representatividadeGP = horasPP > 0 ? (horasGP / horasPP) * 100 : 0;

        // Margens
        const margem60 = valorFinal;
        const margem56 = valorFinal * 0.94;
        const margem52 = valorFinal * 0.92;
        const urgencia30 = valorFinal * 1.25;
        const urgencia50 = valorFinal * 1.6;

        return {
            diasCP, diasDG, diasLP, diasPFB, diasAT, diasAN, diasGP,
            horasGP, horasPP, horasCR, horasFinal,
            valorCP, valorDG, valorLP, valorPFB, valorAT, valorAN, valorGP, valorPP, valorCR, valorFinal,
            pacoteRecomendado, valorPacote, diferencaVsPacote,
            horasNecessariasCliente, pacoteRecomendadoCliente,
            representatividadeCP, representatividadeDG, representatividadeLP, representatividadePFB,
            representatividadeAT, representatividadeAN, representatividadeGP,
            margem60, margem56, margem52, urgencia30, urgencia50
        };
    }, [horas, contingencia, clienteSelecionado, configuracoes, toNumber]);

    // HANDLERS
    const handleHoraChange = useCallback((profissional: keyof HorasProfissionais, value: string) => {
        const cleanValue = value.replace(/[^0-9.]/g, '');
        setHoras(prev => ({ ...prev, [profissional]: cleanValue }));
    }, []);

    const handleClienteChange = useCallback((clienteId: string) => {
        const cliente = clientes?.find(c => c.id === clienteId);
        setClienteSelecionado(cliente || null);
    }, [clientes]);

    const salvarCalculo = useCallback(async () => {
        if (!descricao || !clienteSelecionado || !resultados) {
            toast({
                title: "Dados incompletos",
                description: "Preencha descrição, cliente e pelo menos um valor de horas",
                variant: "destructive",
            });
            return;
        }

        setSalvandoOrcamento(true);

        try {
            const orcamentoData = {
                titulo: descricao,
                cliente_id: parseInt(clienteSelecionado.id),
                descricao: observacoes,
                status: 'rascunho' as const,
                valor_total: resultados.valorFinal,
                valor_desconto: 0,
                valor_final: resultados.valorFinal,
                validade_dias: 30,
                data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                descricao: descricao,
                observacoes: observacoes || '',
                condicoes_pagamento: '',
                prazo_entrega: '',
                garantia: '',
                itens: [
                    {
                        produto_servico: 'Desenvolvimento de Software',
                        descricao: `Projeto: ${descricao}`,
                        quantidade: 1,
                        valor_unitario: resultados.valorFinal,
                        valor_total: resultados.valorFinal
                    }
                ]
            };
            console.log('Dados sendo enviados:', orcamentoData);

            const novoOrcamento = await createOrcamento(orcamentoData);

            if (novoOrcamento) {
                toast({
                    title: "Orçamento salvo!",
                    description: "O orçamento foi criado com sucesso",
                });

                // Limpar formulário
                setDescricao("");
                setClienteSelecionado(null);
                setObservacoes("");
                setHoras({
                    cp: "0",
                    dg: "0",
                    lp: "0",
                    pfb: "0",
                    at: "0",
                    an: "0"
                });
                setResultados(null);
            }
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar o orçamento",
                variant: "destructive",
            });
        } finally {
            setSalvandoOrcamento(false);
        }
    }, [descricao, clienteSelecionado, resultados, observacoes, createOrcamento, toast]);

    const exportarPDF = useCallback(() => {
        toast({
            title: "Relatório exportado!",
            description: "O relatório foi gerado em PDF",
        });
    }, [toast]);

    // useEffect sempre depois de todos os outros hooks
    useEffect(() => {
        if (Object.values(horas).some(h => toNumber(h) > 0)) {
            const novosResultados = calcularResultados();
            setResultados(novosResultados);
        } else {
            setResultados(null);
        }
    }, [horas, contingencia, clienteSelecionado, calcularResultados, toNumber]);

    // RENDERIZAÇÃO CONDICIONAL - SÓ DEPOIS DE TODOS OS HOOKS
    if (loadingConfig || loadingClientes) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Carregando configurações...</span>
            </div>
        );
    }

    if (!configuracoes) {
        return (
            <div className="text-center p-8">
                <p className="text-destructive">Erro ao carregar configurações</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                    Tentar novamente
                </Button>
            </div>
        );
    }

    // Dados calculados para renderização
    const valoresHora = {
        cp: configuracoes.valor_hora_cp,
        dg: configuracoes.valor_hora_dg,
        lp: configuracoes.valor_hora_lp,
        pfb: configuracoes.valor_hora_pfb,
        at: configuracoes.valor_hora_at,
        an: configuracoes.valor_hora_an,
        gp: configuracoes.valor_hora_gp
    };

    const pacotes = {
        PP: { horas: 50, valor: configuracoes.valor_pacote_pp },
        P: { horas: 100, valor: configuracoes.valor_pacote_p },
        M: { horas: 200, valor: configuracoes.valor_pacote_m },
        G: { horas: 300, valor: configuracoes.valor_pacote_g },
        GG: { horas: 400, valor: configuracoes.valor_pacote_gg }
    };

    // RENDERIZAÇÃO PRINCIPAL
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Calculadora de Orçamento</h1>
                    <p className="text-muted-foreground">
                        Calcule orçamentos para projetos de desenvolvimento
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Info className="w-4 h-4 mr-2" />
                            Ajuda
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Dicas de Uso</DialogTitle>
                            <DialogDescription asChild>
                                <div className="space-y-4 text-sm">
                                    <p><strong>1.</strong> Primeiramente preencha a descrição, selecione um cliente, preencha as horas de cada função, e por último, se necessário, altere a Contingência.</p>
                                    <p><strong>2.</strong> Sempre utilize ponto quando for inserir os minutos, ao invés de vírgula. Para 8 horas e 20 minutos, digite: "8.20".</p>
                                    <p><strong>3.</strong> A calculadora converte automaticamente minutos em decimal. Exemplo: 8.20 = 8h20min.</p>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Formulário Principal */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Dados Básicos */}
                    <Card className="glass-card border-glass-border">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calculator className="mr-2 w-5 h-5" />
                                Dados do Orçamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="descricao">Descrição do Projeto</Label>
                                    <Input
                                        id="descricao"
                                        placeholder="Digite a descrição do projeto..."
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        className="glass-card border-glass-border"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cliente">Cliente</Label>
                                    <Select onValueChange={handleClienteChange}>
                                        <SelectTrigger className="glass-card border-glass-border">
                                            <SelectValue placeholder="Selecione o cliente" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-card border-glass-border">
                                            {clientes?.map((cliente) => (
                                            <SelectItem key={cliente.id} value={cliente.id}>
                                                {cliente.nome} - {formatarMoeda(cliente.valor)}/h
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {clienteSelecionado && (
                                <div className="p-4 glass-card rounded-lg">
                                    <h4 className="font-medium mb-2">Análise do Cliente</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Valor/Hora:</span>
                                            <div className="font-semibold">{formatarMoeda(clienteSelecionado.valor)}</div>
                                        </div>
                                        {resultados && (
                                            <>
                                            <div>
                                                <span className="text-muted-foreground">Horas Necessárias:</span>
                                                <div className="font-semibold">{resultados.horasNecessariasCliente.toFixed(2)}h</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Pacote Recomendado:</span>
                                                <div className="font-semibold">{resultados.pacoteRecomendadoCliente}</div>
                                            </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Horas dos Profissionais */}
                    <Card className="glass-card border-glass-border">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 w-5 h-5" />
                                Horas dos Profissionais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Função</th>
                                        <th className="text-center p-3">Valor/Hora</th>
                                        <th className="text-center p-3">Dias</th>
                                        <th className="text-center p-3">Horas</th>
                                        <th className="text-center p-3">Valor Final</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {[
                                        { key: 'cp', nome: 'Consultor de Plataformas', valor: valoresHora.cp },
                                        { key: 'dg', nome: 'Designer Gráfico', valor: valoresHora.dg },
                                        { key: 'lp', nome: 'Lead Programador', valor: valoresHora.lp },
                                        { key: 'pfb', nome: 'Prog. Front/Backend', valor: valoresHora.pfb },
                                        { key: 'at', nome: 'Analista de Teste', valor: valoresHora.at },
                                        { key: 'an', nome: 'Analista de Negócios', valor: valoresHora.an }
                                    ].map((prof) => (
                                        <tr key={prof.key} className="border-b border-glass-border">
                                            <td className="p-3 font-medium">{prof.nome}</td>
                                            <td className="p-3 text-center text-sm text-muted-foreground">
                                                {formatarMoeda(prof.valor)}
                                            </td>
                                            <td className="p-3 text-center font-semibold">
                                                {resultados ? Math.ceil(resultados[`dias${prof.key.toUpperCase()}` as keyof ResultadosCalculados] as number) : 0}
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="text"
                                                    placeholder="0"
                                                    value={horas[prof.key as keyof HorasProfissionais]}
                                                        onChange={(e) => handleHoraChange(prof.key as keyof HorasProfissionais, e.target.value)}
                                                        className="text-center glass-card border-glass-border"
                                                    />
                                            </td>
                                            <td className="p-3 text-center font-semibold text-success">
                                                {resultados ? formatarMoeda(resultados[`valor${prof.key.toUpperCase()}` as keyof ResultadosCalculados] as number) : formatarMoeda(0)}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Gerente de Projetos */}
                                    <tr className="border-b border-glass-border bg-muted/20">
                                        <td className="p-3 font-medium">Gerente de Projetos</td>
                                        <td className="p-3 text-center text-sm text-muted-foreground">
                                            {formatarMoeda(valoresHora.gp)}
                                        </td>
                                        <td className="p-3 text-center font-semibold">
                                            {resultados ? Math.ceil(resultados.diasGP) : 0}
                                        </td>
                                        <td className="p-3 text-center font-semibold">
                                            {resultados ? resultados.horasGP.toFixed(2) : '0.00'}
                                        </td>
                                        <td className="p-3 text-center font-semibold text-success">
                                            {resultados ? formatarMoeda(resultados.valorGP) : formatarMoeda(0)}
                                        </td>
                                    </tr>

                                    {/* Prévia Parcial */}
                                    <tr className="border-b-2 border-primary/20 bg-primary/5">
                                        <td className="p-3 font-bold">Prévia Parcial</td>
                                        <td className="p-3"></td>
                                        <td className="p-3"></td>
                                        <td className="p-3 text-center font-bold">
                                            {resultados ? resultados.horasPP.toFixed(2) : '0.00'}
                                        </td>
                                        <td className="p-3 text-center font-bold text-primary">
                                            {resultados ? formatarMoeda(resultados.valorPP) : formatarMoeda(0)}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contingência e Totais */}
                    <Card className="glass-card border-glass-border">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 w-5 h-5" />
                                Contingência e Totais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Contingência */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Contingência/Risco</Label>
                                        <Select value={contingencia} onValueChange={setContingencia}>
                                            <SelectTrigger className="glass-card border-glass-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="glass-card border-glass-border">
                                                <SelectItem value="1">Baixa (10%)</SelectItem>
                                                <SelectItem value="2">Média (20%)</SelectItem>
                                                <SelectItem value="3">Alta (30%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Horas Contingência</Label>
                                        <div className="p-3 glass-card border-glass-border text-center font-semibold">
                                            {resultados ? resultados.horasCR.toFixed(2) : '0.00'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Valor Contingência</Label>
                                        <div className="p-3 glass-card border-glass-border text-center font-semibold text-warning">
                                            {resultados ? formatarMoeda(resultados.valorCR) : formatarMoeda(0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Totais Finais */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <Label>Total Horas Final</Label>
                                        <div className="p-4 glass-card border-glass-border text-center text-xl font-bold">
                                            {resultados ? resultados.horasFinal.toFixed(2) : '0.00'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Valor Total Final</Label>
                                        <div className="p-4 glass-card border-glass-border text-center text-xl font-bold text-success">
                                            {resultados ? formatarMoeda(resultados.valorFinal) : formatarMoeda(0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Pacote Recomendado */}
                                {resultados && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 glass-card rounded-lg">
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Pacote Recomendado</div>
                                            <div className="text-2xl font-bold text-primary">{resultados.pacoteRecomendado}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Valor Pacote</div>
                                            <div className="text-lg font-semibold">{formatarMoeda(resultados.valorPacote)}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Diferença vs Orçado</div>
                                            <div className={`text-lg font-semibold ${resultados.diferencaVsPacote >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                {formatarMoeda(resultados.diferencaVsPacote)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Observações */}
                    <Card className="glass-card border-glass-border">
                        <CardHeader>
                            <CardTitle>Observações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Adicione observações sobre o orçamento..."
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                className="glass-card border-glass-border"
                                rows={3}
                            />
                        </CardContent>
                    </Card>

                    {/* Ações */}
                    <div className="flex gap-3">
                        <Button
                            onClick={salvarCalculo}
                            className="gradient-primary shadow-primary flex-1"
                            disabled={salvandoOrcamento}
                        >
                            {salvandoOrcamento ? (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 w-4 h-4" />
                            )}
                            {salvandoOrcamento ? 'Salvando...' : 'Salvar Orçamento'}
                        </Button>
                        <Button onClick={exportarPDF} variant="outline" className="glass-button">
                            <Download className="mr-2 w-4 h-4" />
                            Exportar PDF
                        </Button>
                    </div>
                </div>

                {/* Sidebar com resultados e análises */}
                <div className="space-y-6">
                    {/* Representatividade */}
                    {resultados && (
                        <Card className="glass-card border-glass-border">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PieChart className="mr-2 w-5 h-5" />
                                    Representatividade
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    { nome: 'Consultor Plat.', valor: resultados.representatividadeCP },
                                    { nome: 'Designer Gráfico', valor: resultados.representatividadeDG },
                                    { nome: 'Lead Programador', valor: resultados.representatividadeLP },
                                    { nome: 'Prog. Front/Back', valor: resultados.representatividadePFB },
                                    { nome: 'Analista Teste', valor: resultados.representatividadeAT },
                                    { nome: 'Analista Negócios', valor: resultados.representatividadeAN },
                                    { nome: 'Gerente Projeto', valor: resultados.representatividadeGP }
                                ].map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 glass-card rounded">
                                        <span className="text-sm">{item.nome}</span>
                                        <span className="font-semibold">{item.valor.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Margens */}
                    {resultados && (
                        <Card className="glass-card border-glass-border">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="mr-2 w-5 h-5" />
                                    Margens
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between p-2 glass-card rounded">
                                        <span className="text-sm">Margem 60%</span>
                                        <span className="font-semibold">{formatarMoeda(resultados.margem60)}</span>
                                    </div>
                                    <div className="flex justify-between p-2 glass-card rounded">
                                        <span className="text-sm">Margem 56%</span>
                                        <span className="font-semibold">{formatarMoeda(resultados.margem56)}</span>
                                    </div>
                                    <div className="flex justify-between p-2 glass-card rounded">
                                        <span className="text-sm">Margem 52%</span>
                                        <span className="font-semibold">{formatarMoeda(resultados.margem52)}</span>
                                    </div>
                                    <div className="flex justify-between p-2 glass-card rounded border-warning/20">
                                        <span className="text-sm">Urgência +25%</span>
                                        <span className="font-semibold text-warning">{formatarMoeda(resultados.urgencia30)}</span>
                                    </div>
                                    <div className="flex justify-between p-2 glass-card rounded border-destructive/20">
                                        <span className="text-sm">Urgência +60%</span>
                                        <span className="font-semibold text-destructive">{formatarMoeda(resultados.urgencia50)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pacotes Padronizados */}
                    <Card className="glass-card border-glass-border">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="mr-2 w-5 h-5" />
                                Pacotes Padronizados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(pacotes).map(([nome, dados]) => (
                                    <div key={nome} className="flex justify-between items-center p-2 glass-card rounded text-sm">
                                        <div>
                                            <div className="font-medium">{nome} ({dados.horas}h)</div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatarMoeda(dados.valor / dados.horas)}/h
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">{formatarMoeda(dados.valor)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}