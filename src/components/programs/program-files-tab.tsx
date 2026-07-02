"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";

import {
  deleteProgramFileAction,
  uploadProgramFileAction,
} from "@/app/actions/program-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatProgramDateTime,
  formatProgramFileSize,
  type ProgramDetails,
} from "@/lib/program-format";
import type { ProgramFileRow } from "@/lib/supabase/database.types";

type ProgramFilesTabProps = {
  details: ProgramDetails;
  onSaved: (details: ProgramDetails) => void;
};

export function ProgramFilesTab({ details, onSaved }: ProgramFilesTabProps) {
  const toast = useAppToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState(details.files);
  const [isUploading, startUploadTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleUpload(file: File | null) {
    if (!file) {
      return;
    }

    startUploadTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadProgramFileAction(details.program.id, formData);

      if (!result.success) {
        toast.error({
          title: "Falha no upload",
          description: result.error ?? "Não foi possível enviar o arquivo.",
        });
        return;
      }

      if (!result.data?.file) {
        toast.error({
          title: "Falha no upload",
          description: "Não foi possível enviar o arquivo.",
        });
        return;
      }

      const nextFiles = [result.data.file, ...files];
      setFiles(nextFiles);
      onSaved({ ...details, files: nextFiles });
      toast.success({ title: "Arquivo enviado", description: result.message });
    });
  }

  function handleDelete(file: ProgramFileRow) {
    startDeleteTransition(async () => {
      const result = await deleteProgramFileAction(file.id);

      if (!result.success) {
        toast.error({
          title: "Falha ao remover",
          description: result.error ?? "Não foi possível remover o arquivo.",
        });
        return;
      }

      const nextFiles = files.filter((item) => item.id !== file.id);
      setFiles(nextFiles);
      onSaved({ ...details, files: nextFiles });
      toast.success({ title: "Arquivo removido" });
    });
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          handleUpload(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        Enviar Arquivos
      </Button>

      <div className="overflow-hidden rounded-xl border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Data Registro</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Extensão</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length > 0 ? (
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      #{file.id.replace(/\D/g, "").slice(0, 7) || file.id.slice(0, 7)}
                    </span>
                  </TableCell>
                  <TableCell>{formatProgramDateTime(file.created_at)}</TableCell>
                  <TableCell>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {file.file_name}
                    </a>
                  </TableCell>
                  <TableCell>{file.file_extension ?? "—"}</TableCell>
                  <TableCell>{formatProgramFileSize(file.file_size)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting}
                      onClick={() => handleDelete(file)}
                      aria-label="Remover arquivo"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Não há itens a serem exibidos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
