"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { saveAnamnesisAction } from "@/app/actions/anamnesis-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AnamnesisTerapiaOcupacionalForm({ patientId, onSuccess }: { patientId: string, onSuccess?: () => void }) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    queixaPrincipal: "",
    medicamentos: "",
    historiaPregressa: "",
    alergias: "",
    desenvolvimento: {
      controleCervical: false,
      rolou: false,
      arrastou: false,
      segurouObjetos: false,
      sentouSemApoio: false,
      engatinhou: false,
      andouSemApoio: false,
      explorarBoca: false,
      falou: false,
    },
    sono: {
      dificuldades: "",
      bebeAgitado: false,
      choravaMuito: false,
      excessivamentePassivo: false,
    },
    alimentacaoInfo: {
      idadeIntroducao: "",
      comoOfertava: "",
      engasgava: "",
    },
    desfralde: "",
    alteracaoMusculoEsqueletica: {
      forca: false,
      controlePostural: false,
      tonusMuscular: false,
      alinhamentoPostural: false,
      adm: false,
      controleMotorPraxia: false,
      escorregaCadeira: false,
    },
    escola: "",
    higiene: "",
    banho: "",
    vestuario: "",
    alimentacao: "",
    rotina: "",
    objetivosFamilia: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveAnamnesisAction({
        patientId,
        anamnesisType: "terapia_ocupacional",
        formData,
      });

      if (result.success) {
        toast.success({ title: "Anamnese salva", description: "O formulário de terapia ocupacional foi registrado com sucesso." });
        onSuccess?.();
      } else {
        toast.error({ title: "Erro", description: result.error });
      }
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (group: keyof typeof formData, field: string, value: any) => {
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
        <h3 className="text-lg font-semibold text-foreground">Diagnóstico, Queixas e Saúde</h3>
        
        <div className="space-y-2">
          <Label>Queixa Principal e Diagnóstico</Label>
          <Textarea 
            value={formData.queixaPrincipal} 
            onChange={e => updateField("queixaPrincipal", e.target.value)} 
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
          <Label>História Pregressa (Gestação, Parto, Saúde)</Label>
          <Textarea 
            value={formData.historiaPregressa} 
            onChange={e => updateField("historiaPregressa", e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>Alergias (Alimentar, medicamento, etc)</Label>
          <Input 
            value={formData.alergias} 
            onChange={e => updateField("alergias", e.target.value)} 
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Histórico do Desenvolvimento</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(formData.desenvolvimento).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={value as boolean} 
                onChange={e => updateNestedField("desenvolvimento", key, e.target.checked)} 
                className="size-4 rounded border-input"
              />
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Sono e Alimentação (Bebê)</h3>
        <div className="space-y-2">
          <Label>Dificuldades no Padrão do Sono</Label>
          <Input 
            value={formData.sono.dificuldades} 
            onChange={e => updateNestedField("sono", "dificuldades", e.target.value)} 
          />
        </div>
        <div className="flex gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.sono.bebeAgitado} onChange={e => updateNestedField("sono", "bebeAgitado", e.target.checked)} className="size-4 rounded border-input" />
            Bebê Agitado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.sono.choravaMuito} onChange={e => updateNestedField("sono", "choravaMuito", e.target.checked)} className="size-4 rounded border-input" />
            Chorava Muito
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.sono.excessivamentePassivo} onChange={e => updateNestedField("sono", "excessivamentePassivo", e.target.checked)} className="size-4 rounded border-input" />
            Excessivamente Passivo
          </label>
        </div>
        <div className="space-y-2 mt-4">
          <Label>Idade de Introdução Alimentar</Label>
          <Input value={formData.alimentacaoInfo.idadeIntroducao} onChange={e => updateNestedField("alimentacaoInfo", "idadeIntroducao", e.target.value)} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Escola e Atividades da Vida Diária (AVDs)</h3>
        
        <div className="space-y-2">
          <Label>Escola (Nome, Contraturno, Queixas)</Label>
          <Textarea 
            value={formData.escola} 
            onChange={e => updateField("escola", e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>Higiene (Banheiro, Lavar as mãos)</Label>
          <Textarea 
            value={formData.higiene} 
            onChange={e => updateField("higiene", e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>Banho / Vestuário / Alimentação</Label>
          <Textarea 
            value={formData.banho} 
            onChange={e => updateField("banho", e.target.value)} 
            placeholder="Descreva o grau de independência no banho, vestuário e alimentação."
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
