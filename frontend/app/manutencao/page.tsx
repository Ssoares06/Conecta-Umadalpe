import { Wrench } from 'lucide-react';

export default function ManutencaoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldsoft text-brand-blue mb-4">
        <Wrench size={28} />
      </span>
      <h1 className="font-display font-bold text-xl text-brand-bluedeep mb-2">Voltamos já!</h1>
      <p className="text-brand-gray text-sm max-w-xs">
        Estamos em manutenção rápida. Tente novamente em alguns instantes.
      </p>
    </main>
  );
}
