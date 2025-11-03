import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, institutionsAPI, Institution } from "@/services/api";

const userFormSchema = z.object({
  full_name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  role: z.enum([
    "administrador",
    "professor",
    "aluno",
    "coordenador",
    "orientador",
    "secretario",
    "bibliotecario",
    "responsavel",
  ]),
  institution_id: z.string().uuid("ID da instituição inválido"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => Promise<void>;
  user?: User | null;
  loading?: boolean;
}

const roleLabels: Record<string, string> = {
  administrador: "Administrador",
  professor: "Professor",
  aluno: "Aluno",
  coordenador: "Coordenador",
  orientador: "Orientador",
  secretario: "Secretário",
  bibliotecario: "Bibliotecário",
  responsavel: "Responsável",
};

export function UserDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
  loading = false,
}: UserDialogProps) {
  const isEditing = !!user;
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "aluno" as const,
      institution_id: "00000000-0000-0000-0000-000000000001",
    },
  });

  // Carregar instituições
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoadingInstitutions(true);
        const data = await institutionsAPI.list();
        setInstitutions(data);
      } catch (error) {
        console.error("Erro ao carregar instituições:", error);
        // Se falhar, usar uma instituição padrão
        setInstitutions([
          {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Instituição Padrão",
          },
        ]);
      } finally {
        setLoadingInstitutions(false);
      }
    };

    if (open) {
      fetchInstitutions();
    }
  }, [open]);

  // Preencher formulário ao editar
  useEffect(() => {
    if (user && open) {
      // Concatenar first_name e last_name para full_name
      const fullName = `${user.first_name} ${user.last_name}`.trim();
      
      form.reset({
        full_name: fullName,
        email: user.email,
        password: "",
        role: user.role as any,
        institution_id: user.institution_id || "00000000-0000-0000-0000-000000000001",
      });
      
      console.log('Preenchendo formulário com dados do usuário:', {
        fullName,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id
      });
    } else if (!open) {
      form.reset();
    }
  }, [user, open, form]);

  const handleSubmit = async (data: UserFormValues) => {
    try {
      // Dividir full_name em first_name e last_name
      const nameParts = data.full_name.trim().split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

      // Preparar dados para envio
      const submitData: any = {
        first_name,
        last_name,
        role: data.role,
      };

      // Se for criação, incluir campos obrigatórios
      if (!isEditing) {
        submitData.email = data.email;
        submitData.password = data.password;
        submitData.institution_id = data.institution_id;
      } else {
        // Se for edição, incluir apenas se foram alterados
        if (data.email !== user?.email) {
          submitData.email = data.email;
        }
        if (data.institution_id !== user?.institution_id) {
          submitData.institution_id = data.institution_id;
        }
        // Adicionar senha apenas se fornecida
        if (data.password && data.password.trim()) {
          submitData.password = data.password;
        }
      }

      console.log('Enviando dados:', isEditing ? 'Edição' : 'Criação', submitData);
      
      await onSubmit(submitData);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error; // Re-throw para o componente pai tratar
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do usuário. Deixe a senha em branco para manter a atual."
              : "Preencha os dados para criar um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="João Silva"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="joao.silva@example.com"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? "Nova Senha (opcional)" : "Senha"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={isEditing ? "Deixe em branco para manter" : "••••••"}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institution_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instituição</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading || loadingInstitutions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma instituição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingInstitutions ? (
                        <SelectItem value="loading" disabled>
                          Carregando...
                        </SelectItem>
                      ) : institutions.length > 0 ? (
                        institutions.map((institution) => (
                          <SelectItem key={institution.id} value={institution.id}>
                            {institution.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Nenhuma instituição disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
