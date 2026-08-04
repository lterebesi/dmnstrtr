"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Card } from "@/components/ui/Card";

const INITIAL_STATE: AuthActionState = { error: null };

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    INITIAL_STATE,
  );

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <TextField label="Nume complet" name="name" autoComplete="name" required />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <TextField
          label="Telefon (opțional)"
          name="phone"
          type="tel"
          autoComplete="tel"
        />
        <TextField
          label="Parolă"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-gray-700">Sunt</legend>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="role"
              value="LOCATAR"
              defaultChecked
              className="text-blue-600"
            />
            Locatar
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="radio" name="role" value="ADMINISTRATOR" className="text-blue-600" />
            Administrator de bloc
          </label>
        </fieldset>

        {state.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state.info && (
          <p role="status" className="text-sm text-green-700">
            {state.info}
          </p>
        )}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Se creează contul..." : "Creează cont"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Ai deja cont?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Conectează-te
        </Link>
      </p>
    </Card>
  );
}
