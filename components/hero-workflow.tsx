"use client";

import { motion } from "framer-motion";
import { Camera, CircleDollarSign, Clock3, Gauge, MessageSquareText, Wrench } from "lucide-react";

const steps = [
  { icon: Camera, title: "Upload photos", copy: "Add up to five clear device images." },
  { icon: MessageSquareText, title: "Describe symptoms", copy: "Explain what changed in everyday language." },
  { icon: Gauge, title: "AI diagnosis", copy: "Receive likely faults with a confidence score." },
  { icon: CircleDollarSign, title: "Know the cost", copy: "Review a realistic repair-cost range." },
  { icon: Clock3, title: "Plan your time", copy: "Understand duration and repair difficulty." },
  { icon: Wrench, title: "Book repair", copy: "Carry the diagnosis directly into booking." },
] as const;

export function HeroWorkflow() {
  return (
    <section aria-labelledby="value-workflow-title" className="relative -mt-2 border-y border-slate-200/80 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="container">
        <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-2">One connected workflow</p>
            <h2 id="value-workflow-title" className="m-0 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              From uncertainty to an informed repair decision
            </h2>
          </div>
          <p className="m-0 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Understand the fault before paying for parts, avoid unnecessary repairs, and share a clear report with a trusted technician.
          </p>
        </div>
        <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map(({ icon: Icon, title, copy }, index) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.055 }}
              className="group relative rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/60 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-800"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-950 dark:text-blue-300">
                  <Icon size={19} aria-hidden />
                </span>
                <span className="text-xs font-bold text-slate-300 dark:text-slate-600">0{index + 1}</span>
              </div>
              <h3 className="m-0 text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-1 mb-0 text-xs leading-5 text-slate-500 dark:text-slate-400">{copy}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
