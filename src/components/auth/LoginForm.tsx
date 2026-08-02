"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Card } from "@/components/ui/Card";

const INITIAL_STATE: AuthActionState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <TextField
          label="Parolă"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Se conectează..." : "Conectare"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Nu ai cont?{" "}
        <Link href="/register" className="font-medium text-blue-600 hover:underline">
          Înregistrează-te
        </Link>
      </p>
    </Card>
  );
}
