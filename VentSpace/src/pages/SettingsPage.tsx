import { useEffect, useState } from "react";
import { getUserSettings, updateUserSettings, type UserSettings } from "../services/settingsService";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState("");

  const [theme, setTheme] = useState("default");

  // useEffect(() => {
  //   async function load() {
  //     const data = await getUserSettings();
  //     setSettings(data);
  //     setLoading(false);
  //   }
  //   load();
  // }, []);

  useEffect(() => {
    async function load() {
      const data = await getUserSettings();
      setSettings(data);

      const savedTheme = localStorage.getItem("theme") || "default";
      setTheme(savedTheme);

      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
  const saved = localStorage.getItem("theme") || "default";
  document.documentElement.setAttribute("data-theme", saved);
  }, []);

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    setSuccess(false);

    await updateUserSettings({
      nickname: settings.nickname,
      avatarUrl: settings.avatarUrl || undefined,
      password: password || undefined,
      notifyOnComments: settings.notifyOnComments,
      notifyOnReactions: settings.notifyOnReactions,
    });

    setPassword("");
    setSaving(false);
    setSuccess(true);

    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) return <div className="p-6">Loading settings...</div>;
  if (!settings) return <div className="p-6">Failed to load settings.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">

      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white shadow-sm border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Profile</h2>

        <div>
          <label className="block text-sm mb-1">Nickname</label>
          <input
            value={settings.nickname}
            onChange={e =>
              setSettings({ ...settings, nickname: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Avatar URL</label>
          <input
            value={settings.avatarUrl || ""}
            onChange={e =>
              setSettings({ ...settings, avatarUrl: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Theme</label>

          <select
            value={theme}
            onChange={(e) => {
              const value = e.target.value;
              setTheme(value);

              document.documentElement.setAttribute("data-theme", value);
              localStorage.setItem("theme", value);
            }}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="default">Calm (Default)</option>
            <option value="dark">Dark</option>
            <option value="ocean">Ocean</option>
            <option value="forest">Forest</option>
          </select>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white shadow-sm border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Security</h2>

        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white shadow-sm border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Notifications</h2>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.notifyOnComments}
            onChange={e =>
              setSettings({ ...settings, notifyOnComments: e.target.checked })
            }
          />
          Notify me when someone comments on my post
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.notifyOnReactions}
            onChange={e =>
              setSettings({ ...settings, notifyOnReactions: e.target.checked })
            }
          />
          Notify me when someone reacts to my content
        </label>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {success && (
          <span className="text-green-600 text-sm">
            Settings updated successfully.
          </span>
        )}
      </div>

    </div>
  );
}