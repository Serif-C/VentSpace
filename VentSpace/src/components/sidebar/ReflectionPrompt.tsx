import { useMemo } from "react";
import { Link } from "react-router-dom";

const prompts = [
  "What's something that has been weighing on your mind lately?",
  "What made today harder than expected?",
  "Is there something you wish someone understood about you?",
  "What emotion have you been feeling the most recently?",
  "What’s something small that bothered you today?",
  "What’s something you wish you could say out loud?",
];

export default function ReflectionPrompt() {

  const prompt = useMemo(() => {
    const day = new Date().getDate();
    return prompts[day % prompts.length];
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">

      <h3 className="text-sm font-semibold text-slate-600">
        ✨ Reflection Prompt
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {prompt}
      </p>

      <Link
        to="/new"
        className="mt-3 inline-block text-xs font-medium text-indigo-600 hover:underline"
      >
        Write a post →
      </Link>

    </div>
  );
}