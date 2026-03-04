import { useEffect, useRef, useState } from "react";
import { streamChatMessage } from "../../services/chatService";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi I’m here with you. Want to share what’s on your mind today?" },
  ]);
  const [loading, setLoading] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function onSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
        // send only last 12 messages for context
        const history = next.slice(-12).map(({ role, content }) => ({ role, content }));
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        let current = "";

        await streamChatMessage(text, history, (token) => {
            current += token;

            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = current;
                return updated;
            });
        });
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry — I had trouble responding. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[9999] bg-indigo-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-600 transition flex items-center justify-center text-xl"
        aria-label="Open support chat"
      >
        💬
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-80 max-w-[90vw] bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
            <div className="text-sm font-semibold">Emotional Support</div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-3 space-y-3 bg-stone-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    m.role === "user"
                      ? "bg-indigo-500 text-white rounded-br-md"
                      : "bg-white text-slate-700 border border-stone-200 rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-white text-slate-500 border border-stone-200">
                  typing…
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-stone-200 bg-white">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSend();
                }}
                placeholder="Type here…"
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={onSend}
                disabled={loading}
                className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition disabled:opacity-50"
              >
                Send
              </button>
            </div>

            <div className="text-[11px] text-slate-400 mt-2">
              Not a therapist. If you’re in danger, please reach out to a trusted adult or local emergency services.
            </div>
          </div>
        </div>
      )}
    </>
  );
}