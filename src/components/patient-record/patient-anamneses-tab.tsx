"use client";

import { useEffect, useState } from "react";
import { ClipboardList, PlusCircle, FileText } from "lucide-react";

import { getAnamnesisListAction, type AnamnesisRecord } from "@/app/actions/anamnesis-actions";
import { AnamnesisFisioterapiaForm } from "@/components/clinical-reports/anamnesis-fisioterapia-form";
import { AnamnesisTerapiaOcupacionalForm } from "@/components/clinical-reports/anamnesis-terapia-ocupacional-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPatientDateTime } from "@/lib/patient-format";

export function PatientAnamnesesTab({ patientId }: { patientId: string }) {
  const [anamneses, setAnamneses] = useState<AnamnesisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("fisioterapia");

  const loadAnamneses = async () => {
    setIsLoading(true);
    const data = await getAnamnesisListAction(patientId);
    setAnamneses(data);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadAnamneses();
  }, [patientId]);

  const handleSuccess = () => {
    setIsCreating(false);
    void loadAnamneses();
  };

  return (
    <div className="space-y-4">
      {isCreating ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Nova Anamnese</CardTitle>
                <CardDescription>Preencha os dados do formulário estruturado.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                Voltar
              </Button>
            </div>
            <div className="mt-4 max-w-sm">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
                  <SelectItem value="terapia_ocupacional">Terapia Ocupacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedType === "fisioterapia" && <AnamnesisFisioterapiaForm patientId={patientId} onSuccess={handleSuccess} />}
            {selectedType === "terapia_ocupacional" && <AnamnesisTerapiaOcupacionalForm patientId={patientId} onSuccess={handleSuccess} />}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" />
                  Anamneses Registradas
                </CardTitle>
                <CardDescription>Histórico de anamneses estruturadas do paciente.</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setIsCreating(true)}>
                <PlusCircle className="size-4" /> Nova Anamnese
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Carregando...</div>
            ) : anamneses.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                <p>Nenhuma anamnese registrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {anamneses.map(anamnese => (
                  <div key={anamnese.id} className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium capitalize text-foreground">
                        <FileText className="mr-2 inline size-4 text-primary" />
                        Anamnese de {anamnese.anamnesisType.replace("_", " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">Criado em {formatPatientDateTime(anamnese.createdAt)}</p>
                    </div>
                    {/* Aqui poderia abrir um modal de visualização dos dados JSON */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
