import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cliente, ClienteFormData } from "@/services/api";

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (data: ClienteFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClienteForm({ cliente, onSubmit, onCancel, isLoading = false }: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClienteFormData>({
    defaultValues: {
      name: cliente?.name || "",
      email: cliente?.email || "",
      phone: cliente?.phone || "",
      empresa: cliente?.empresa || "",
      cargo: cliente?.cargo || "",
      valor: cliente?.valor || 150.00,
    },
  });

  const handleFormSubmit = (data: ClienteFormData) => {
    onSubmit({
      ...data,
      valor: Number(data.valor),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          {...register("name", { 
            required: "Nome é obrigatório",
            minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" }
          })}
          placeholder="Digite o nome completo"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <Input
          id="email"
          type="email"
          {...register("email", { 
            required: "E-mail é obrigatório",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "E-mail inválido"
            }
          })}
          placeholder="Digite o e-mail"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="(11) 99999-9999"
        />
      </div>

      {/* Empresa */}
      <div className="space-y-2">
        <Label htmlFor="empresa">Empresa</Label>
        <Input
          id="empresa"
          {...register("empresa")}
          placeholder="Nome da empresa"
        />
      </div>

      {/* Cargo */}
      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo</Label>
        <Input
          id="cargo"
          {...register("cargo")}
          placeholder="Cargo na empresa"
        />
      </div>

      {/* Valor por hora */}
      <div className="space-y-2">
        <Label htmlFor="valor">Valor por Hora (R$) *</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          min="0"
          {...register("valor", { 
            required: "Valor por hora é obrigatório",
            min: { value: 0, message: "Valor deve ser maior que zero" }
          })}
          placeholder="150.00"
        />
        {errors.valor && (
          <p className="text-sm text-destructive">{errors.valor.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : cliente ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}