"use client";

export const Logo = () => (
  <div className="flex items-center gap-2 font-semibold text-white">
    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-500 text-lg font-bold text-white shadow-lg shadow-teal-500/30">
      €
    </span>
    <div className="leading-tight">
      <p className="text-sm uppercase tracking-[0.08em] text-teal-100">
        Casa
      </p>
      <p className="text-lg font-semibold">Spese</p>
    </div>
  </div>
);
