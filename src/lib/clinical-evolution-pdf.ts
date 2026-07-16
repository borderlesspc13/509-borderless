import {
  CLINIC_REPORT_HEADER,
  formatPatientBirthDate,
  type ClinicalPatient,
} from "@/lib/clinical-evolution-data";

export type ClinicalEvolutionPdfInput = {
  patient: ClinicalPatient;
  sessionDate: string;
  contentHtml: string;
  professionalName: string;
  professionalRole: string;
  professionalCouncil?: string;
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReportHtml(input: ClinicalEvolutionPdfInput) {
  const councilLine = input.professionalCouncil
    ? `<p style="margin:8px 0 0;font-size:13px;"><strong>Registro profissional:</strong> ${escapeHtml(input.professionalCouncil)}</p>`
    : "";

  const narrativeContent =
    input.contentHtml.trim() && input.contentHtml !== "<br>"
      ? input.contentHtml
      : "<p><em>Sem conteúdo registrado.</em></p>";

  return `
    <div id="clinical-evolution-report" style="width:794px;padding:48px;font-family:Georgia,'Times New Roman',serif;color:#111827;background:#ffffff;line-height:1.6;">
      <header style="border-bottom:2px solid #1d4ed8;padding-bottom:20px;margin-bottom:28px;">
        <h1 style="margin:0 0 6px;font-size:24px;color:#1d4ed8;">${escapeHtml(CLINIC_REPORT_HEADER.name)}</h1>
        <p style="margin:0;font-size:12px;color:#4b5563;">${escapeHtml(CLINIC_REPORT_HEADER.legalName)} · CNPJ ${escapeHtml(CLINIC_REPORT_HEADER.cnpj)}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#4b5563;">${escapeHtml(CLINIC_REPORT_HEADER.address)}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#4b5563;">${escapeHtml(CLINIC_REPORT_HEADER.phone)} · ${escapeHtml(CLINIC_REPORT_HEADER.email)}</p>
      </header>

      <section style="margin-bottom:24px;">
        <h2 style="margin:0 0 12px;font-size:16px;text-transform:uppercase;letter-spacing:0.04em;color:#111827;">Relatório de Evolução Clínica</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:13px;">
          <p style="margin:0;"><strong>Paciente:</strong> ${escapeHtml(input.patient.name)}</p>
          <p style="margin:0;"><strong>Data de nascimento:</strong> ${escapeHtml(formatPatientBirthDate(input.patient.birthDate))}</p>
          <p style="margin:0;"><strong>Responsável:</strong> ${escapeHtml(input.patient.guardian)}</p>
          <p style="margin:0;"><strong>Diagnóstico:</strong> ${escapeHtml(input.patient.diagnosis)}</p>
          <p style="margin:0;"><strong>Data da sessão:</strong> ${escapeHtml(formatSessionDate(input.sessionDate))}</p>
          <p style="margin:0;"><strong>Profissional:</strong> ${escapeHtml(input.professionalName)}</p>
        </div>
        <p style="margin:8px 0 0;font-size:13px;"><strong>Cargo:</strong> ${escapeHtml(input.professionalRole)}</p>
        ${councilLine}
      </section>

      <section style="margin-bottom:36px;">
        <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:#374151;">Evolução narrativa</h3>
        <div style="font-size:14px;color:#111827;">${narrativeContent}</div>
      </section>

      <footer style="margin-top:48px;padding-top:24px;border-top:1px solid #d1d5db;">
        <p style="margin:0 0 48px;font-size:13px;color:#4b5563;">Documento gerado em ${escapeHtml(formatGeneratedAt())}.</p>
        <div style="width:280px;border-top:1px solid #111827;padding-top:8px;">
          <p style="margin:0;font-size:14px;font-weight:600;">${escapeHtml(input.professionalName)}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#4b5563;">${escapeHtml(input.professionalRole)}${input.professionalCouncil ? ` · ${escapeHtml(input.professionalCouncil)}` : ""}</p>
          <p style="margin:16px 0 0;font-size:11px;color:#6b7280;">Assinatura do profissional responsável</p>
        </div>
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
        color: #111827;
      }
      h1, h2, h3, p, ul, ol, li, strong, em {
        color: inherit;
      }
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
    foreignObjectRendering: false,
    onclone: (clonedDocument) => {
      clonedDocument.documentElement.style.background = "#ffffff";
      clonedDocument.body.style.background = "#ffffff";
      clonedDocument.body.style.color = "#111827";
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
  fileName: string
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 15;
  const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  let cursorY = margin;

  function ensureSpace(lineHeight: number) {
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (cursorY + lineHeight > pageHeight - margin) {
      pdf.addPage();
      cursorY = margin;
    }
  }

  function writeLine(text: string, fontSize = 11, fontStyle: "normal" | "bold" = "normal") {
    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      ensureSpace(fontSize * 0.45);
      pdf.text(line, margin, cursorY);
      cursorY += fontSize * 0.45;
    });
  }

  writeLine(CLINIC_REPORT_HEADER.name, 16, "bold");
  writeLine(`${CLINIC_REPORT_HEADER.legalName} · CNPJ ${CLINIC_REPORT_HEADER.cnpj}`, 9);
  writeLine(CLINIC_REPORT_HEADER.address, 9);
  writeLine(`${CLINIC_REPORT_HEADER.phone} · ${CLINIC_REPORT_HEADER.email}`, 9);
  cursorY += 4;

  writeLine("Relatório de Evolução Clínica", 13, "bold");
  writeLine(`Paciente: ${input.patient.name}`);
  writeLine(`Data de nascimento: ${formatPatientBirthDate(input.patient.birthDate)}`);
  writeLine(`Responsável: ${input.patient.guardian}`);
  writeLine(`Diagnóstico: ${input.patient.diagnosis}`);
  writeLine(`Data da sessão: ${formatSessionDate(input.sessionDate)}`);
  writeLine(`Profissional: ${input.professionalName}`);
  writeLine(`Cargo: ${input.professionalRole}`);

  if (input.professionalCouncil) {
    writeLine(`Registro profissional: ${input.professionalCouncil}`);
  }

  cursorY += 4;
  writeLine("Evolução narrativa", 12, "bold");
  writeLine(stripHtmlToText(input.contentHtml) || "Sem conteúdo registrado.");
  cursorY += 8;

  writeLine(`Documento gerado em ${formatGeneratedAt()}.`, 9);
  cursorY += 12;
  writeLine(input.professionalName, 11, "bold");
  writeLine(
    `${input.professionalRole}${input.professionalCouncil ? ` · ${input.professionalCouncil}` : ""}`,
    9
  );
  writeLine("Assinatura do profissional responsável", 8);

  pdf.save(fileName);
}

async function addCanvasToPdf(canvas: HTMLCanvasElement, fileName: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
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
    doc.write(buildIsolatedReportDocument(buildReportHtml(input)));
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
      console.warn("[evolucao-pdf] html2canvas falhou, usando layout textual.", canvasError);
      await generatePdfWithTextLayout(input, fileName);
    }
  } finally {
    document.body.removeChild(iframe);
  }
}
