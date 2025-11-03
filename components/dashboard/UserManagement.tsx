import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UserPlus, Pencil, Trash2 } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "../../src/components/ui/data-table";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../src/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "../../src/components/ui/alert";
import { LoadingOverlay } from "../../src/components/ui/loading";
import { ConfirmDialog } from "../../src/components/ui/confirm-dialog";
import { UserDialog } from "../../src/components/dashboard/UserDialog";
import { toast } from "../../src/hooks/use-toast";
import { usersAPI, User } from "../../src/services/api";

const roleColors: Record<string, string> = {
  administrador: "bg-purple-100 text-purple-800",
  professor: "bg-blue-100 text-blue-800",
  aluno: "bg-green-100 text-green-800",
  coordenador: "bg-orange-100 text-orange-800",
  orientador: "bg-pink-100 text-pink-800",
  secretario: "bg-yellow-100 text-yellow-800",
  bibliotecario: "bg-indigo-100 text-indigo-800",
  responsavel: "bg-gray-100 text-gray-800",
};

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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAPI.list();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar usuários");
      toast.error("Erro ao carregar usuários", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Abrir diálogo para criar novo usuário
  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  // Abrir diálogo para editar usuário
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  // Abrir diálogo de confirmação para excluir
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Definir colunas do DataTable
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const fullName = `${user.first_name} ${user.last_name}`;
        const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Função" />
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge className={roleColors[role] || "bg-gray-100 text-gray-800"}>
            {roleLabels[role] || role}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status");
        const isActive = status === "active";
        return (
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data de Criação" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(user)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  // Criar ou atualizar usuário
  const handleUserSubmit = async (data: any) => {
    try {
      setActionLoading(true);

      if (selectedUser) {
        // Atualizar usuário existente
        await usersAPI.update(selectedUser.id, data);
        toast.success("Usuário atualizado com sucesso");
      } else {
        // Criar novo usuário
        await usersAPI.create(data);
        toast.success("Usuário criado com sucesso");
      }

      setUserDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Recarregar lista
    } catch (err: any) {
      toast.error(
        selectedUser
          ? "Erro ao atualizar usuário"
          : "Erro ao criar usuário",
        {
          description: err.message,
        }
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Excluir usuário
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setActionLoading(true);
      await usersAPI.delete(userToDelete.id);
      toast.success("Usuário excluído com sucesso");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Recarregar lista
    } catch (err: any) {
      toast.error("Erro ao excluir usuário", {
        description: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}{" "}
            <Button
              variant="link"
              size="sm"
              onClick={fetchUsers}
              className="p-0 h-auto"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* DataTable com Loading Overlay */}
      <div className="relative">
        {loading && <LoadingOverlay message="Carregando usuários..." />}
        <DataTable
          columns={columns}
          data={users}
          searchKey="email"
          searchPlaceholder="Buscar por email..."
          loading={loading}
        />
      </div>

      {/* User Dialog (Create/Edit) */}
      <UserDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        onSubmit={handleUserSubmit}
        user={selectedUser}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Excluir Usuário?"
        description={
          userToDelete
            ? `Tem certeza que deseja excluir o usuário "${userToDelete.full_name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmText="Excluir"
        variant="destructive"
        loading={actionLoading}
      />
    </div>
  );
}
