import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Validar a assinatura/token do provedor de WhatsApp (Ex: Z-API, Evolution, etc)
    // const token = request.headers.get("Authorization");
    // if (token !== process.env.WHATSAPP_WEBHOOK_TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await request.json();

    // 2. Extrair os dados da mensagem recebida
    // A estrutura do payload varia conforme o provedor. 
    // Exemplo genérico:
    const fromNumber = payload.from; // Número do telefone do paciente
    const textMessage = payload.text?.body?.trim().toLowerCase(); // Texto recebido (ex: "1" para confirmar, "2" para cancelar)

    if (!fromNumber || !textMessage) {
      return NextResponse.json({ success: true, message: "Payload ignorado (não é texto ou remetente inválido)." });
    }

    let newStatus: "confirmado" | "cancelado" | null = null;
    if (textMessage === "1" || textMessage === "confirmar") {
      newStatus = "confirmado";
    } else if (textMessage === "2" || textMessage === "cancelar") {
      newStatus = "cancelado";
    }

    if (!newStatus) {
      // Se não for uma resposta de confirmação, apenas ignorar
      return NextResponse.json({ success: true, message: "Mensagem não reconhecida como confirmação." });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    // 3. Buscar o paciente correspondente pelo número de telefone
    // O banco armazena o telefone na coluna guardian_phone ou phone
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .or(`guardian_phone.ilike.%${fromNumber}%,phone.ilike.%${fromNumber}%`)
      .limit(1)
      .single();

    if (patientError || !patient) {
      return NextResponse.json({ success: true, message: "Nenhum paciente encontrado para este número." });
    }

    // 4. Buscar o agendamento futuro mais próximo desse paciente que está 'agendado'
    const today = new Date().toISOString().split("T")[0];
    const { data: appointment, error: appointmentError } = await supabase
      .from("agenda_events")
      .select("id")
      .eq("patient_id", patient.id)
      .eq("status", "agendado")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(1)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json({ success: true, message: "Nenhum agendamento pendente encontrado para este paciente." });
    }

    // 5. Atualizar o status do agendamento
    const { error: updateError } = await supabase
      .from("agenda_events")
      .update({ status: newStatus })
      .eq("id", appointment.id);

    if (updateError) {
      console.error("[WHATSAPP WEBHOOK] Erro ao atualizar agendamento:", updateError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    console.log(`[WHATSAPP WEBHOOK] Agendamento ${appointment.id} atualizado para ${newStatus} via WhatsApp (${fromNumber}).`);

    // Aqui poderia disparar uma resposta via API do provedor (Ex: "Obrigado! Consulta confirmada com sucesso.")

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WHATSAPP WEBHOOK] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
