export function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY?.trim() ?? null;
}

export function getOpenAiDefaultModel() {
  return process.env.AI_DEFAULT_MODEL?.trim() || "gpt-4.1-mini";
}

export function getOpenAiGlobalModel() {
  return process.env.AI_GLOBAL_MODEL?.trim() || "gpt-4.1";
}

export function isAiMockMode() {
  const explicit = process.env.AI_MOCK_MODE?.trim().toLowerCase();

  if (explicit === "false") {
    return false;
  }

  if (explicit === "true") {
    return true;
  }

  return !getOpenAiApiKey();
}

export function isAiEnabled() {
  return isAiMockMode() || Boolean(getOpenAiApiKey());
}
