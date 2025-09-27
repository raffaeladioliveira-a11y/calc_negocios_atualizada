import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Orcamento, OrcamentoFormData, Cliente } from "@/services/api";

interface OrcamentoFormProps {
  orcamento?: Orcamento | null;
  clientes: Cliente[];
  onSubmit: (data: OrcamentoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OrcamentoForm({ 
  orcamento, 
  clientes, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: OrcamentoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrcamentoFormData>({
    defaultValues: {
      cliente_id: orcamento?.cliente_id || 0,
      titulo: orcamento?.titulo || "",
      descricao: orcamento?.descricao || "",
      valor_total: orcamento?.valor_total || 0,
    },
  });

  const clienteId = watch("cliente_id");

  const handleFormSubmit = (data: OrcamentoFormData) => {
    onSubmit({
      ...data,
      cliente_id: Number(data.cliente_id),
      valor_total: Number(data.valor_total),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Cliente */}
      <div className="space-y-2">
        <Label htmlFor="cliente_id">Cliente *</Label>
        <Select
          value={clienteId?.toString() || ""}
          onValueChange={(value) => setValue("cliente_id", parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id.toString()}>
                {cliente.name} - {cliente.empresa || cliente.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cliente_id && (
          <p className="text-sm text-destructive">Cliente é obrigatório</p>
        )}
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          {...register("titulo", { 
            required: "Título é obrigatório",
            minLength: { value: 3, message: "Título deve ter pelo menos 3 caracteres" }
          })}
          placeholder="Digite o título do orçamento"
        />
        {errors.titulo && (
          <p className="text-sm text-destructive">{errors.titulo.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          {...register("descricao")}
          placeholder="Descreva os detalhes do orçamento (opcional)"
          rows={3}
        />
      </div>

      {/* Valor Total */}
      <div className="space-y-2">
        <Label htmlFor="valor_total">Valor Total (R$) *</Label>
        <Input
          id="valor_total"
          type="number"
          step="0.01"
          min="0"
          {...register("valor_total", { 
            required: "Valor total é obrigatório",
            min: { value: 0.01, message: "Valor deve ser maior que zero" }
          })}
          placeholder="1500.00"
        />
        {errors.valor_total && (
          <p className="text-sm text-destructive">{errors.valor_total.message}</p>
        )}
      </div>

      {/* Cliente Info Preview */}
      {clienteId && clientes.length > 0 && (
        <div className="p-3 bg-accent/5 rounded-lg border">
          <p className="text-sm font-medium text-foreground">
            Informações do Cliente:
          </p>
          {(() => {
            const selectedCliente = clientes.find(c => c.id === clienteId);
            if (selectedCliente) {
              return (
                <div className="text-sm text-muted-foreground mt-1">
                  <p>
                    <strong>Nome:</strong> {selectedCliente.name}
                  </p>
                  {selectedCliente.empresa && (
                    <p>
                      <strong>Empresa:</strong> {selectedCliente.empresa}
                    </p>
                  )}
                  <p>
                    <strong>Valor/Hora:</strong> R$ {selectedCliente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !clienteId}>
          {isLoading ? "Salvando..." : orcamento ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}