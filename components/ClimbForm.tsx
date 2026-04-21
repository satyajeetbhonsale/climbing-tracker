"use client";

import { useState } from "react";
import { insertClimb } from "@/lib/supabase";
import { GRADES } from "@/lib/constants";
import type { Grade } from "@/lib/constants";
import type { Environment, Discipline } from "@/lib/types";

const today = () => new Date().toISOString().split("T")[0];

interface FormState {
  date: string;
  environment: Environment;
  discipline: Discipline;
  name: string;
  grade: Grade;
  is_sent: boolean;
  attempts: number;
  location: string;
  time_spent_minutes: string;
  notes: string;
}

const defaultForm = (): FormState => ({
  date: today(),
  environment: "indoor",
  discipline: "boulder",
  name: "",
  grade: "6a",
  is_sent: true,
  attempts: 1,
  location: "",
  time_spent_minutes: "",
  notes: "",
});

export default function ClimbForm() {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await insertClimb({
        date: form.date,
        environment: form.environment,
        discipline: form.discipline,
        name: form.name.trim(),
        grade: form.grade,
        is_sent: form.is_sent,
        attempts: form.attempts,
        location: form.location.trim(),
        time_spent_minutes: form.time_spent_minutes ? Number(form.time_spent_minutes) : null,
        notes: form.notes.trim() || null,
      });
      setStatus("success");
      setForm(defaultForm());
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("[ClimbForm] insert failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Date & Environment */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date">
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Environment">
          <select
            value={form.environment}
            onChange={(e) => set("environment", e.target.value as Environment)}
            className={inputCls}
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </Field>
      </div>

      {/* Discipline & Grade */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Discipline">
          <select
            value={form.discipline}
            onChange={(e) => set("discipline", e.target.value as Discipline)}
            className={inputCls}
          >
            <option value="boulder">Boulder</option>
            <option value="toprope">Top rope</option>
            <option value="lead">Lead</option>
          </select>
        </Field>
        <Field label="Grade">
          <select
            value={form.grade}
            onChange={(e) => set("grade", e.target.value as Grade)}
            className={inputCls}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Name */}
      <Field label="Route / problem name" optional>
        <input
          type="text"
          placeholder="e.g. The Slab Project"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls}
        />
      </Field>

      {/* Location */}
      <Field label="Location" optional>
        <input
          type="text"
          placeholder="e.g. Bleau Forest or Home wall"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          className={inputCls}
        />
      </Field>

      {/* Sent & Attempts */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Result">
          <select
            value={form.is_sent ? "sent" : "project"}
            onChange={(e) => set("is_sent", e.target.value === "sent")}
            className={inputCls}
          >
            <option value="sent">Sent</option>
            <option value="project">Project (not sent)</option>
          </select>
        </Field>
        <Field label="Attempts">
          <input
            type="number"
            min={1}
            required
            value={form.attempts}
            onChange={(e) => set("attempts", Math.max(1, Number(e.target.value)))}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Time spent */}
      <Field label="Time spent (minutes)" optional>
        <input
          type="number"
          min={1}
          placeholder="e.g. 90"
          value={form.time_spent_minutes}
          onChange={(e) => set("time_spent_minutes", e.target.value)}
          className={inputCls}
        />
      </Field>

      {/* Notes */}
      <Field label="Notes" optional>
        <textarea
          rows={3}
          placeholder="Beta, conditions, feelings…"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "loading"}
        className="self-start rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {status === "loading" ? "Saving…" : "Save climb"}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-600">Climb saved!</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
    </form>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">
        {label}
        {optional && <span className="ml-1 text-gray-400 font-normal">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500";
