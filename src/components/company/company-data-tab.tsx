"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  Clock3,
  ImageIcon,
  Loader2,
  MapPinned,
  Pencil,
} from "lucide-react";

import { updateCompanyProfileAction } from "@/app/actions/company-actions";
import { uploadClinicLogoAction } from "@/app/actions/clinic-settings-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  CompanyFormField,
  companyInputClassName,
} from "@/components/company/company-form-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatCompanyRegistrationDate,
  type CompanyProfile,
} from "@/lib/company-profile";
import { formatCnpjDisplay } from "@/lib/clinic-settings";

type CompanyDataTabProps = {
  profile: CompanyProfile;
  onProfileChange: (profile: CompanyProfile) => void;
};

export function CompanyDataTab({
  profile,
  onProfileChange,
}: CompanyDataTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useAppToast();
  const [legalName, setLegalName] = useState(profile.legalName);
  const [tradeName, setTradeName] = useState(profile.tradeName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [mobilePhone, setMobilePhone] = useState(profile.mobilePhone ?? "");
  const [municipalRegistration, setMunicipalRegistration] = useState(
    profile.municipalRegistration ?? ""
  );
  const [stateRegistration, setStateRegistration] = useState(
    profile.stateRegistration ?? ""
  );
  const [email, setEmail] = useState(profile.email ?? "");
  const [contactName, setContactName] = useState(profile.contactName ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [zipCode, setZipCode] = useState(profile.zipCode ?? "");
  const [state, setState] = useState(profile.state ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [street, setStreet] = useState(profile.street ?? "");
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood ?? "");
  const [addressComplement, setAddressComplement] = useState(
    profile.addressComplement ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();

  const displayName = profile.tradeName?.trim() || profile.legalName;

  function handleLogoUpload(file: File | null) {
    if (!file) {
      return;
    }

    startUploadTransition(async () => {
      const formData = new FormData();
      formData.append("logo", file);

      const result = await uploadClinicLogoAction(formData);

      if (!result.success) {
        toast.error({
          title: "Falha no upload",
          description: result.error,
        });
        return;
      }

      if (result.data) {
        onProfileChange({
          ...profile,
          logoUrl: result.data.logoUrl,
        });
      }

      toast.success({
        title: "Logo atualizada",
        description: "A logo da empresa foi enviada.",
      });
    });
  }

  function handleSave() {
    setError(null);

    startSaveTransition(async () => {
      const result = await updateCompanyProfileAction({
        legalName,
        tradeName,
        phone,
        mobilePhone,
        municipalRegistration,
        stateRegistration,
        email,
        contactName,
        website,
        zipCode,
        state,
        city,
        street,
        neighborhood,
        addressComplement,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar os dados.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      if (result.data) {
        onProfileChange(result.data);
        setLegalName(result.data.legalName);
        setTradeName(result.data.tradeName ?? "");
      }

      toast.success({
        title: "Dados salvos",
        description: "Informações da empresa atualizadas.",
      });
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/25 px-5 py-4">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/30">
                {profile.logoUrl ? (
                  <Image
                    src={profile.logoUrl}
                    alt={`Logo ${displayName}`}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <ImageIcon className="size-10 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border border-border/70 bg-clinical-warning text-foreground shadow-sm"
                aria-label="Enviar logo"
              >
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Pencil className="size-3.5" />
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(event) => {
                handleLogoUpload(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />

            <h2 className="mt-4 text-base font-semibold text-foreground">
              {profile.legalName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.cnpjFormatted || "CNPJ não informado"}
            </p>

            <div className="mt-4 grid w-full gap-2 text-left text-sm">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">Plano</span>
                <span className="font-medium text-clinical-warning">
                  {profile.planName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  Data Cadastro
                </span>
                <span className="text-right text-xs font-medium">
                  {formatCompanyRegistrationDate(profile.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">Código Empresa</span>
                <span className="font-medium">{profile.companyCode}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <CompanyFormField id="legal-name" label="Nome" required>
            <Input
              id="legal-name"
              value={legalName}
              onChange={(event) => setLegalName(event.target.value)}
              className={companyInputClassName}
            />
          </CompanyFormField>

          <CompanyFormField id="trade-name" label="Nome Fantasia" required>
            <Input
              id="trade-name"
              value={tradeName}
              onChange={(event) => setTradeName(event.target.value)}
              className={companyInputClassName}
            />
          </CompanyFormField>

          <CompanyFormField
            id="company-cnpj"
            label="CNPJ"
            hint="Para alteração do CNPJ, é necessário entrar em contato com nosso time do Suporte."
          >
            <Input
              id="company-cnpj"
              value={formatCnpjDisplay(profile.cnpj)}
              className={companyInputClassName}
              readOnly
              disabled
            />
          </CompanyFormField>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button
            type="button"
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </section>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/60 bg-muted/25 px-5 py-3.5">
            <Building2 className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Dados Gerais</h3>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <CompanyFormField id="phone" label="Telefone">
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="mobile-phone" label="Celular">
              <Input
                id="mobile-phone"
                value={mobilePhone}
                onChange={(event) => setMobilePhone(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="municipal-registration" label="Inscrição Municipal">
              <Input
                id="municipal-registration"
                value={municipalRegistration}
                onChange={(event) =>
                  setMunicipalRegistration(event.target.value)
                }
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="state-registration" label="Inscrição Estadual">
              <Input
                id="state-registration"
                value={stateRegistration}
                onChange={(event) => setStateRegistration(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="email" label="E-mail">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="contact-name" label="Contato">
              <Input
                id="contact-name"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="website" label="Site" className="sm:col-span-2">
              <Input
                id="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/60 bg-muted/25 px-5 py-3.5">
            <MapPinned className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Endereço</h3>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <CompanyFormField id="zip-code" label="CEP">
              <Input
                id="zip-code"
                value={zipCode}
                onChange={(event) => setZipCode(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="state" label="Estado">
              <Input
                id="state"
                value={state}
                onChange={(event) => setState(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="city" label="Cidade">
              <Input
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="street" label="Logradouro" className="sm:col-span-2">
              <Input
                id="street"
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField id="neighborhood" label="Bairro">
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(event) => setNeighborhood(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
            <CompanyFormField
              id="address-complement"
              label="Complemento"
              className="sm:col-span-3"
            >
              <Input
                id="address-complement"
                value={addressComplement}
                onChange={(event) => setAddressComplement(event.target.value)}
                className={companyInputClassName}
              />
            </CompanyFormField>
          </div>
        </section>
      </div>
    </div>
  );
}
