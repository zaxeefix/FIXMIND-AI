"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { signup } from "./actions";

export default function SignupPage(){const[state,action,pending]=useActionState(signup,{error:""});return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="card w-full max-w-md bg-white shadow-xl"><Logo/><p className="eyebrow mt-8">Free customer account</p><h1 className="h1 mb-2 mt-2 font-bold">Unlock FixMind AI</h1><p className="muted">Create your account to diagnose devices, save reports, and track repairs.</p><form action={action} className="mt-7 grid gap-5"><Field label="Full name" name="name"/><Field label="Email" name="email" type="email"/><Field label="Password" name="password" type="password"/>{state.error&&<p role="alert" className="m-0 rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}<button disabled={pending} className="btn btn-primary w-full">{pending?"Creating account…":"Create Free Account"}</button></form><p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-semibold text-blue-600">Sign in</Link></p></section></main>}
function Field({label,name,type="text"}:{label:string;name:string;type?:string}){return <label><span className="label">{label}</span><input className="input" name={name} type={type} required minLength={type==="password"?8:2}/></label>}
