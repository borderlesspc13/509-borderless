import {
  formatPatientBirthDate,
  type ClinicalPatient,
} from "@/lib/clinical-evolution-data";
import {
  buildDocumentFooterHtml,
  buildDocumentHeaderHtml,
  DEFAULT_DOCUMENT_BRANDING,
  DOCUMENT_BRAND_COLORS,
  escapeDocumentHtml,
  resolveDocumentLogoUrl,
  type DocumentBranding,
} from "@/lib/document-branding";

export type ClinicalEvolutionPdfInput = {
  patient: ClinicalPatient;
  sessionDate: string;
  contentHtml: string;
  professionalName: string;
  professionalRole: string;
  professionalCouncil?: string;
  branding?: DocumentBranding;
};

function formatSessionDate(sessionDate: string) {
  const [year, month, day] = sessionDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatGeneratedAt() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { cache: "force-cache" });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === "string" ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function buildMetaCell(label: string, value: string) {
  return `
    <div style="padding:10px 12px;background:#F7FAFC;border:1px solid ${DOCUMENT_BRAND_COLORS.border};border-radius:8px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${DOCUMENT_BRAND_COLORS.muted};font-family:Helvetica,Arial,sans-serif;">${escapeDocumentHtml(label)}</p>
      <p style="margin:0;font-size:13px;color:${DOCUMENT_BRAND_COLORS.text};font-family:Georgia,'Times New Roman',serif;">${escapeDocumentHtml(value)}</p>
    </div>
  `;
}

function buildReportHtml(
  input: ClinicalEvolutionPdfInput,
  branding: DocumentBranding,
  logoDataUrl: string
) {
  const councilLine = input.professionalCouncil
    ? buildMetaCell("Registro profissional", input.professionalCouncil)
    : "";

  const narrativeContent =
    input.contentHtml.trim() && input.contentHtml !== "<br>"
      ? input.contentHtml
      : "<p><em>Sem conteúdo registrado.</em></p>";

  const generatedAt = formatGeneratedAt();

  return `
    <div id="clinical-evolution-report" style="width:794px;padding:40px 44px;font-family:Georgia,'Times New Roman',serif;color:${DOCUMENT_BRAND_COLORS.text};background:${DOCUMENT_BRAND_COLORS.background};line-height:1.65;">
      ${buildDocumentHeaderHtml(branding, {
        logoUrl: logoDataUrl,
        documentTitle: "Relatório de Evolução Clínica",
      })}

      <section style="margin-bottom:28px;">
        <h2 style="margin:0 0 14px;font-size:15px;font-family:Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;color:${DOCUMENT_BRAND_COLORS.navy};">
          Dados do atendimento
        </h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${buildMetaCell("Paciente", input.patient.name)}
          ${buildMetaCell("Data de nascimento", formatPatientBirthDate(input.patient.birthDate))}
          ${buildMetaCell("Responsável", input.patient.guardian)}
          ${buildMetaCell("Diagnóstico", input.patient.diagnosis)}
          ${buildMetaCell("Data da sessão", formatSessionDate(input.sessionDate))}
          ${buildMetaCell("Profissional", input.professionalName)}
          ${buildMetaCell("Cargo", input.professionalRole)}
          ${councilLine}
        </div>
      </section>

      <section style="margin-bottom:32px;">
        <h3 style="margin:0 0 12px;font-size:13px;font-family:Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;color:${DOCUMENT_BRAND_COLORS.navy};">
          Evolução narrativa
        </h3>
        <div style="padding:16px 18px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};border-left:4px solid ${DOCUMENT_BRAND_COLORS.teal};border-radius:8px;font-size:14px;color:${DOCUMENT_BRAND_COLORS.text};background:#FBFDFF;">
          ${narrativeContent}
        </div>
      </section>

      <footer style="margin-top:40px;">
        <div style="width:300px;margin-top:56px;border-top:1px solid ${DOCUMENT_BRAND_COLORS.navy};padding-top:10px;">
          <p style="margin:0;font-size:14px;font-weight:700;font-family:Helvetica,Arial,sans-serif;color:${DOCUMENT_BRAND_COLORS.navy};">
            ${escapeDocumentHtml(input.professionalName)}
          </p>
          <p style="margin:4px 0 0;font-size:12px;color:${DOCUMENT_BRAND_COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
            ${escapeDocumentHtml(input.professionalRole)}${input.professionalCouncil ? ` · ${escapeDocumentHtml(input.professionalCouncil)}` : ""}
          </p>
          <p style="margin:14px 0 0;font-size:10px;letter-spacing:0.04em;text-transform:uppercase;color:${DOCUMENT_BRAND_COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
            Assinatura do profissional responsável
          </p>
        </div>
        ${buildDocumentFooterHtml(generatedAt)}
      </footer>
    </div>
  `;
}

function buildIsolatedReportDocument(html: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: ${DOCUMENT_BRAND_COLORS.text};
      }
      h1, h2, h3, p, ul, ol, li, strong, em {
        color: inherit;
      }
      img { max-width: 100%; }
    </style>
  </head>
  <body>${html}</body>
</html>`;
}

async function renderReportToCanvas(reportElement: HTMLElement) {
  const html2canvas = (await import("html2canvas")).default;

  return html2canvas(reportElement, {
    scale: 2,
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
    allowTaint: false,
    foreignObjectRendering: false,
    onclone: (clonedDocument) => {
      clonedDocument.documentElement.style.background = "#ffffff";
      clonedDocument.body.style.background = "#ffffff";
      clonedDocument.body.style.color = DOCUMENT_BRAND_COLORS.text;
    },
  });
}

function stripHtmlToText(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.textContent?.trim() ?? "";
}

async function generatePdfWithTextLayout(
  input: ClinicalEvolutionPdfInput,
  branding: DocumentBranding,
  fileName: string,
  logoDataUrl: string | null
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 16;
  const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  let cursorY = margin;

  function ensureSpace(lineHeight: number) {
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (cursorY + lineHeight > pageHeight - margin) {
      pdf.addPage();
      cursorY = margin;
    }
  }

  function writeLine(
    text: string,
    fontSize = 11,
    fontStyle: "normal" | "bold" = "normal",
    color: [number, number, number] = [17, 24, 39]
  ) {
    pdf.setTextColor(...color);
    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      ensureSpace(fontSize * 0.5);
      pdf.text(line, margin, cursorY);
      cursorY += fontSize * 0.5;
    });
  }

  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, "PNG", margin, cursorY - 2, 42, 14);
      cursorY += 16;
    } catch {
      // segue sem logo no fallback textual
    }
  }

  writeLine(branding.clinicName, 15, "bold", [27, 42, 74]);

  if (branding.legalName && branding.legalName !== branding.clinicName) {
    writeLine(branding.legalName, 9, "normal", [91, 100, 114]);
  }

  if (branding.cnpjFormatted) {
    writeLine(`CNPJ ${branding.cnpjFormatted}`, 9, "normal", [91, 100, 114]);
  }

  if (branding.address) {
    writeLine(branding.address, 9, "normal", [91, 100, 114]);
  }

  const contact = [branding.phone, branding.email].filter(Boolean).join(" · ");
  if (contact) {
    writeLine(contact, 9, "normal", [91, 100, 114]);
  }

  cursorY += 3;
  pdf.setDrawColor(91, 158, 166);
  pdf.setLineWidth(0.6);
  pdf.line(margin, cursorY, margin + maxWidth, cursorY);
  cursorY += 8;

  writeLine("Relatório de Evolução Clínica", 13, "bold", [27, 42, 74]);
  cursorY += 2;
  writeLine(`Paciente: ${input.patient.name}`);
  writeLine(
    `Data de nascimento: ${formatPatientBirthDate(input.patient.birthDate)}`
  );
  writeLine(`Responsável: ${input.patient.guardian}`);
  writeLine(`Diagnóstico: ${input.patient.diagnosis}`);
  writeLine(`Data da sessão: ${formatSessionDate(input.sessionDate)}`);
  writeLine(`Profissional: ${input.professionalName}`);
  writeLine(`Cargo: ${input.professionalRole}`);

  if (input.professionalCouncil) {
    writeLine(`Registro profissional: ${input.professionalCouncil}`);
  }

  cursorY += 4;
  writeLine("Evolução narrativa", 12, "bold", [27, 42, 74]);
  writeLine(stripHtmlToText(input.contentHtml) || "Sem conteúdo registrado.");
  cursorY += 10;

  writeLine(`Documento gerado em ${formatGeneratedAt()}.`, 9, "normal", [
    91, 100, 114,
  ]);
  cursorY += 14;
  writeLine(input.professionalName, 11, "bold", [27, 42, 74]);
  writeLine(
    `${input.professionalRole}${input.professionalCouncil ? ` · ${input.professionalCouncil}` : ""}`,
    9,
    "normal",
    [91, 100, 114]
  );
  writeLine("Assinatura do profissional responsável", 8, "normal", [
    91, 100, 114,
  ]);

  pdf.save(fileName);
}

async function addCanvasToPdf(canvas: HTMLCanvasElement, fileName: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const imageData = canvas.toDataURL("image/png");
  const imageHeight = (canvas.height * printableWidth) / canvas.width;

  let offsetY = 0;
  let pageIndex = 0;

  while (offsetY < imageHeight) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      imageData,
      "PNG",
      margin,
      margin - offsetY,
      printableWidth,
      imageHeight
    );

    offsetY += printableHeight;
    pageIndex += 1;
  }

  pdf.save(fileName);
}

export async function generateClinicalEvolutionPdf(
  input: ClinicalEvolutionPdfInput
) {
  const branding = input.branding ?? DEFAULT_DOCUMENT_BRANDING;
  const logoUrl = resolveDocumentLogoUrl(branding);
  const logoDataUrl =
    (await loadImageAsDataUrl(logoUrl)) ??
    (await loadImageAsDataUrl(resolveDocumentLogoUrl(DEFAULT_DOCUMENT_BRANDING))) ??
    logoUrl;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;height:0;border:0;visibility:hidden;";

  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;

    if (!doc) {
      throw new Error("Não foi possível preparar o documento do relatório.");
    }

    doc.open();
    doc.write(
      buildIsolatedReportDocument(
        buildReportHtml(input, branding, logoDataUrl)
      )
    );
    doc.close();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    const reportElement = doc.getElementById("clinical-evolution-report");

    if (!reportElement) {
      throw new Error("Estrutura do relatório não encontrada.");
    }

    const fileName = `evolucao-${input.patient.name.toLowerCase().replace(/\s+/g, "-")}-${input.sessionDate}.pdf`;

    try {
      const canvas = await renderReportToCanvas(reportElement);
      await addCanvasToPdf(canvas, fileName);
    } catch (canvasError) {
      console.warn(
        "[evolucao-pdf] html2canvas falhou, usando layout textual.",
        canvasError
      );
      await generatePdfWithTextLayout(
        input,
        branding,
        fileName,
        logoDataUrl.startsWith("data:") ? logoDataUrl : null
      );
    }
  } finally {
    document.body.removeChild(iframe);
  }
}
