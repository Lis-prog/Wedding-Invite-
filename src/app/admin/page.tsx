"use client";

import { FormEvent, useState } from "react";

type ResponseRow = {
  id: string;
  created_at: string;
  guest_name: string;
  invite_type: "single" | "couple" | "family";
  partner_name: string | null;
  children_count: number;
  accepted: boolean;
  answers: Array<{ questionId: string; answer: string }>;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<ResponseRow[]>([]);

  async function loadResponses(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await response.json()) as { error?: string; responses?: ResponseRow[] };

      if (!response.ok) {
        throw new Error(body.error || "Could not load responses.");
      }

      setRows(body.responses || []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-shell">
      <main className="admin-main">
        <h1>RSVP Admin</h1>
        <form className="admin-form" onSubmit={loadResponses}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="submit">{loading ? "Loading..." : "Load responses"}</button>
        </form>
        {error && <p className="admin-error">{error}</p>}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Answer</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.guest_name}
                    {row.partner_name ? ` + ${row.partner_name}` : ""}
                    {row.children_count ? ` (+${row.children_count} kids)` : ""}
                  </td>
                  <td>{row.invite_type}</td>
                  <td>{row.accepted ? "Invited" : "Revoked"}</td>
                  <td>{row.answers?.[3]?.answer || "-"}</td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5}>No responses loaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
