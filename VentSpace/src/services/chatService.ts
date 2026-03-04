import { apiFetch } from "./api";

export async function streamChatMessage(
  message: string,
  history: any[],
  onToken: (token: string) => void
) {
  const res = await fetch("http://localhost:4000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history }),
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    onToken(chunk);
  }
}