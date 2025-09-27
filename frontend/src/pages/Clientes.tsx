import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Mail, Phone, Building2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { clientesApi, Cliente, ClienteFormData } from "@/services/api";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Clientes() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes', searchQuery],
    queryFn: () => clientesApi.getAll(searchQuery || undefined),
  });

  // Fetch client statistics
  const { data: clienteStats } = useQuery({
    queryKey: ['cliente-stats'],
    queryFn: clientesApi.getStats,
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: clientesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente-stats'] });
      setIsFormOpen(false);
      toast({
        title: "Cliente criado",
        description: "Cliente criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar cliente",
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClienteFormData> }) =>
      clientesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsFormOpen(false);
      setEditingCliente(null);
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar cliente",
        variant: "destructive",
      });
    },
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: clientesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente-stats'] });
      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover cliente",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ClienteFormData) => {
    if (editingCliente) {
      updateMutation.mutate({ id: editingCliente.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCliente(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes e seus contatos
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
              <DialogDescription>
                {editingCliente 
                  ? "Atualize as informações do cliente"
                  : "Adicione um novo cliente ao sistema"
                }
              </DialogDescription>
            </DialogHeader>
            <ClienteForm
              cliente={editingCliente}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, email ou empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-border/50"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="business-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {clienteStats?.total || clientes.length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="business-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-accent">
                  {clienteStats?.ativos || clientes.filter(c => c.status === 'Ativo').length}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-accent"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="business-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cálculos</p>
                <p className="text-2xl font-bold text-purple-400">
                  {clientes.reduce((sum, c) => sum + c.calculations, 0)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-400/10">
                <span className="text-purple-400 text-sm">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="business-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Novos (mês)</p>
                <p className="text-2xl font-bold text-blue-400">
                  {clientes.filter(c => {
                    const created = new Date(c.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="text-blue-400 text-xl">↗</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="business-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : clientes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="business-card hover-lift group">
              <CardContent className="p-6">
                {/* Header with Avatar and Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="avatar-gradient text-primary-foreground font-semibold">
                        {cliente.avatar || cliente.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{cliente.name}</h3>
                      <p className="text-sm text-muted-foreground">{cliente.cargo || 'Cliente'}</p>
                      <Badge 
                        className={cliente.status === 'Ativo' ? 'status-active text-xs' : 'status-inactive text-xs'}
                      >
                        {cliente.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(cliente)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Company Info */}
                {cliente.empresa && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {cliente.empresa}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {cliente.email}
                  </div>
                  {cliente.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {cliente.phone}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-muted-foreground">Cálculos</span>
                    <p className="font-semibold text-foreground">{cliente.calculations}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Última atividade</span>
                    <p className="font-medium text-foreground">
                      {cliente.last_activity ? 
                        new Date(cliente.last_activity).toLocaleDateString('pt-BR') : 
                        'Nunca'
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Phone className="h-3 w-3 mr-1" />
                    Ligar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="business-card">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum cliente encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 
                "Tente ajustar os filtros de busca ou criar um novo cliente." : 
                "Comece criando seu primeiro cliente para gerenciar seus contatos."
              }
            </p>
            <Button onClick={() => setIsFormOpen(true)} className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro cliente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}