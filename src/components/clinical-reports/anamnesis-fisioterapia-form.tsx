"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { saveAnamnesisAction } from "@/app/actions/anamnesis-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AnamnesisFisioterapiaForm({ patientId, onSuccess }: { patientId: string, onSuccess?: () => void }) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    queixaPrincipal: "",
    queixaFuncional: "",
    medicamentos: "",
    historiaPregressa: "",
    desenvolvimento: {
      rolou: false,
      arrastou: false,
      segurouObjetos: false,
      sentou: false,
      engatinhou: false,
      andou: false,
    },
    alteracaoMusculoEsqueletica: {
      forca: false,
      controlePostural: false,
      tonusMuscular: false,
      alinhamentoPostural: false,
      adm: false,
      controleMotorPraxia: false,
      equilibrioDinamico: false,
      equilibrioEstatico: false,
    },
    escola: "",
    rotina: "",
    objetivosFamilia: "",
    objetivosFuncionais: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveAnamnesisAction({
        patientId,
        anamnesisType: "fisioterapia",
        formData,
      });

      if (result.success) {
        toast.success({ title: "Anamnese salva", description: "O formulário de fisioterapia foi registrado com sucesso." });
        onSuccess?.();
      } else {
        toast.error({ title: "Erro", description: result.error });
      }
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (group: keyof typeof formData, field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [group]: {
        ...(prev[group] as any),
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Queixas e Histórico</h3>
        
        <div className="space-y-2">
          <Label>Queixa Principal</Label>
          <Textarea 
            value={formData.queixaPrincipal} 
            onChange={e => updateField("queixaPrincipal", e.target.value)} 
            placeholder="Descreva a queixa principal..."
          />
        </div>

        <div className="space-y-2">
          <Label>Queixa Principal Funcional (quedas, coordenação, etc)</Label>
          <Textarea 
            value={formData.queixaFuncional} 
            onChange={e => updateField("queixaFuncional", e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>Medicamentos</Label>
          <Input 
            value={formData.medicamentos} 
            onChange={e => updateField("medicamentos", e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>História Pregressa (Gestação, Parto, etc)</Label>
          <Textarea 
            value={formData.historiaPregressa} 
            onChange={e => updateField("historiaPregressa", e.target.value)} 
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Desenvolvimento Motor</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(formData.desenvolvimento).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={value} 
                onChange={e => updateNestedField("desenvolvimento", key, e.target.checked)} 
                className="size-4 rounded border-input"
              />
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Alterações Musculoesqueléticas</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Object.entries(formData.alteracaoMusculoEsqueletica).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={value} 
                onChange={e => updateNestedField("alteracaoMusculoEsqueletica", key, e.target.checked)} 
                className="size-4 rounded border-input"
              />
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Rotina e Objetivos</h3>
        
        <div className="space-y-2">
          <Label>Escola / Contraturno / Queixas Escolares</Label>
          <Textarea 
            value={formData.escola} 
            onChange={e => updateField("escola", e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>Rotina (Acordar, Brincar, Sono, Telas)</Label>
          <Textarea 
            value={formData.rotina} 
            onChange={e => updateField("rotina", e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>Objetivos e Expectativas da Família</Label>
          <Textarea 
            value={formData.objetivosFamilia} 
            onChange={e => updateField("objetivosFamilia", e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>Principais Déficits / Objetivos Funcionais Mensuráveis</Label>
          <Textarea 
            value={formData.objetivosFuncionais} 
            onChange={e => updateField("objetivosFuncionais", e.target.value)} 
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="gap-2">
          <Save className="size-4" />
          {isPending ? "Salvando..." : "Salvar Anamnese"}
        </Button>
      </div>
    </form>
  );
}
