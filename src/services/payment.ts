import {
  getMercadoPagoAccessToken,
  getPaymentProvider,
  getStripeSecretKey,
  isPaymentConfigured,
  type PaymentProvider,
} from "@/lib/payment/env";

export type CreatePaymentLinkInput = {
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
};

export type CreatePaymentLinkResult = {
  url: string;
  provider: PaymentProvider;
  externalId?: string;
};

function toMinorUnits(amount: number) {
  return Math.round(amount * 100);
}


async function createStripePaymentLink(
  input: CreatePaymentLinkInput
): Promise<CreatePaymentLinkResult> {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY não configurada.");
  }

  const currency = (input.currency ?? "brl").toLowerCase();
  const body = new URLSearchParams();
  body.append("line_items[0][quantity]", "1");
  body.append(
    "line_items[0][price_data][currency]",
    currency
  );
  body.append(
    "line_items[0][price_data][unit_amount]",
    String(toMinorUnits(input.amount))
  );
  body.append(
    "line_items[0][price_data][product_data][name]",
    input.description
  );

  if (input.metadata) {
    Object.entries(input.metadata).forEach(([key, value]) => {
      body.append(`metadata[${key}]`, value);
    });
  }

  const response = await fetch("https://api.stripe.com/v1/payment_links", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const payload = (await response.json()) as {
    url?: string;
    id?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.url) {
    throw new Error(
      payload.error?.message ?? "Falha ao gerar link de pagamento no Stripe."
    );
  }

  return {
    url: payload.url,
    provider: "stripe",
    externalId: payload.id,
  };
}

async function createMercadoPagoPaymentLink(
  input: CreatePaymentLinkInput
): Promise<CreatePaymentLinkResult> {
  const accessToken = getMercadoPagoAccessToken();

  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
  }

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: input.description,
            quantity: 1,
            unit_price: input.amount,
            currency_id: (input.currency ?? "BRL").toUpperCase(),
          },
        ],
        metadata: input.metadata ?? {},
        auto_return: "approved",
      }),
    }
  );

  const payload = (await response.json()) as {
    init_point?: string;
    sandbox_init_point?: string;
    id?: string;
    message?: string;
  };

  const url = payload.init_point ?? payload.sandbox_init_point;

  if (!response.ok || !url) {
    throw new Error(
      payload.message ?? "Falha ao gerar link de pagamento no Mercado Pago."
    );
  }

  return {
    url,
    provider: "mercado_pago",
    externalId: payload.id,
  };
}

export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<CreatePaymentLinkResult> {
  if (input.amount <= 0) {
    throw new Error("O valor da sessão deve ser maior que zero.");
  }

  if (!isPaymentConfigured()) {
    throw new Error(
      "Pagamento não configurado. Defina STRIPE_SECRET_KEY ou MERCADO_PAGO_ACCESS_TOKEN."
    );
  }

  const provider = getPaymentProvider();

  if (provider === "mercado_pago") {
    return createMercadoPagoPaymentLink(input);
  }

  return createStripePaymentLink(input);
}
