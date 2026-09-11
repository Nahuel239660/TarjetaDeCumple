"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/actions";

const initialState: { error?: string } = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);

  return (
    <form className="admin-login-form" action={action}>
      <label htmlFor="admin-password">Contraseña</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus />
      {state.error && <p role="alert" className="form-error">{state.error}</p>}
      <button className="button button--primary button--block" type="submit" disabled={pending}>{pending ? "Ingresando…" : "Ingresar"}</button>
    </form>
  );
}
