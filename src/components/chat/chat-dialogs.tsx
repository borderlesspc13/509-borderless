"use client";

import { useMemo, useState } from "react";
import { Check, Search, Users, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from "@/contexts/chat-context";
import { useAppToast } from "@/hooks/use-app-toast";
import type { ChatMemberPreview } from "@/lib/chat";
import { cn } from "@/lib/utils";

type NewChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  const { users, startDirectChat, isLoadingUsers } = useChat();
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.profileLabel.toLowerCase().includes(query)
    );
  }, [search, users]);

  async function handleSelectUser(user: ChatMemberPreview) {
    setIsStarting(true);
    setError(null);

    const result = await startDirectChat(user.id);

    setIsStarting(false);

    if (result.conversationId) {
      toast.success({
        title: "Conversa iniciada",
        description: `Chat aberto com ${user.fullName}.`,
      });
      setSearch("");
      onOpenChange(false);
      return;
    }

    const message = result.error ?? "Não foi possível iniciar a conversa.";
    setError(message);
    toast.error({ title: "Falha ao iniciar conversa", description: message });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="size-5" />
            Nova conversa
          </DialogTitle>
          <DialogDescription>
            Selecione um colega para iniciar um chat privado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou cargo..."
              className="pl-9"
            />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {isLoadingUsers ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Carregando equipe...
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum colega encontrado.
              </p>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  disabled={isStarting}
                  onClick={() => void handleSelectUser(user)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:opacity-60"
                >
                  <span
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      user.isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {user.fullName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {user.profileLabel}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateGroupDialog({
  open,
  onOpenChange,
}: CreateGroupDialogProps) {
  const { users, createGroup, isLoadingUsers } = useChat();
  const toast = useAppToast();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      user.fullName.toLowerCase().includes(query)
    );
  }, [search, users]);

  function toggleMember(userId: string) {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  async function handleCreate() {
    setIsCreating(true);
    setError(null);

    const result = await createGroup(name, selectedIds);

    setIsCreating(false);

    if (result.conversationId) {
      toast.success({
        title: "Grupo criado",
        description: "O grupo foi criado com sucesso.",
      });
      setName("");
      setSearch("");
      setSelectedIds([]);
      onOpenChange(false);
      return;
    }

    const message =
      result.error ??
      "Não foi possível criar o grupo. Verifique o nome e os participantes.";
    setError(message);
    toast.error({ title: "Falha ao criar grupo", description: message });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Criar grupo
          </DialogTitle>
          <DialogDescription>
            Crie um canal de comunicação com vários participantes da equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Nome do grupo</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Equipe de Recepção"
            />
          </div>

          <div className="space-y-2">
            <Label>Participantes</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar participantes..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {isLoadingUsers ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Carregando equipe...
              </p>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedIds.includes(user.id);

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleMember(user.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted",
                      isSelected && "bg-primary/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      )}
                    >
                      {isSelected ? <Check className="size-3" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {user.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.profileLabel}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            className="w-full"
            disabled={isCreating || !name.trim() || selectedIds.length === 0}
            onClick={() => void handleCreate()}
          >
            {isCreating ? "Criando grupo..." : "Criar grupo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
