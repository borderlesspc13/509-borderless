export type PaymentProvider = "stripe" | "mercado_pago";

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();

  if (provider === "mercado_pago" || provider === "mercadopago") {
    return "mercado_pago";
  }

  return "stripe";
}

export function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? null;
}

export function getMercadoPagoAccessToken() {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim() ?? null;
}

export function getDefaultSessionAmount() {
  const raw = process.env.DEFAULT_SESSION_AMOUNT?.trim();
  const parsed = raw ? Number.parseFloat(raw) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 150;
}

export function isPaymentConfigured() {
  const provider = getPaymentProvider();

  if (provider === "mercado_pago") {
    return Boolean(getMercadoPagoAccessToken());
  }

  return Boolean(getStripeSecretKey());
}
