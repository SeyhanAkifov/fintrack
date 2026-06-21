"use client";

/**
 * ProfileForm — forms to change the display name and password.
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ProfileFormProps {
  email: string;
  initialName: string;
}

// Two forms: update the display name and change the password.
export function ProfileForm({ email, initialName }: ProfileFormProps) {
  const { update } = useSession();

  // ── Name ───────────────────────────────────────────────────────────────────
  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Saves the new display name and refreshes the session so the navbar updates.
  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const b = await res.json();
        setNameMsg({ ok: false, text: b.error ?? "Failed to save." });
        return;
      }
      await update({ name: name.trim() });
      setNameMsg({ ok: true, text: "Name updated." });
    } catch {
      setNameMsg({ ok: false, text: "Network error." });
    } finally {
      setSavingName(false);
    }
  }

  // ── Password ─────────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Validates and submits a password change (verifies the current password server-side).
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg({ ok: false, text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirm) {
      setPwMsg({ ok: false, text: "Passwords do not match." });
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const b = await res.json();
        setPwMsg({ ok: false, text: b.error ?? "Failed to change password." });
        return;
      }
      setPwMsg({ ok: true, text: "Password changed." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setPwMsg({ ok: false, text: "Network error." });
    } finally {
      setSavingPw(false);
    }
  }

  const msgClass = (ok: boolean) =>
    ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <Card title="Account">
        <form onSubmit={saveName} className="flex flex-col gap-4">
          <Input label="Email" value={email} disabled />
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          {nameMsg && <p className={`text-xs ${msgClass(nameMsg.ok)}`}>{nameMsg.text}</p>}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={savingName}>
              {savingName ? "Saving…" : "Save name"}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Change password">
        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {pwMsg && <p className={`text-xs ${msgClass(pwMsg.ok)}`}>{pwMsg.text}</p>}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={savingPw}>
              {savingPw ? "Saving…" : "Change password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
