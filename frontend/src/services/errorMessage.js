export function getErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === "string") return first;
    if (first?.msg) return String(first.msg);
    return fallbackMessage;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
