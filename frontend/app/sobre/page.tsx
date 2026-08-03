import { Header } from '@/components/Header';
import { Instagram } from 'lucide-react';

export default function SobrePage() {
  return (
    <main className="min-h-screen px-5 pb-12 max-w-md mx-auto">
      <Header title="Conheça a UMADALPE" />

      <div className="space-y-6">
        <section className="card-surface p-5">
          <h2 className="font-display font-semibold text-brand-bluedeep mb-2">Nossa história</h2>
          <p className="text-sm text-brand-gray leading-relaxed">
            A UMADALPE de Maranguape II Baixo nasceu do desejo de unir jovens em torno de um propósito:
            viver e anunciar o evangelho de Cristo. Ao longo dos anos, temos crescido em número e em fé,
            sendo uma casa de acolhimento para jovens de toda a região.
          </p>
        </section>

        <section className="card-surface p-5">
          <h2 className="font-display font-semibold text-brand-bluedeep mb-2">Missão e valores</h2>
          <ul className="text-sm text-brand-gray space-y-1.5 list-disc pl-4">
            <li>Levar jovens a um encontro genuíno com Jesus</li>
            <li>Formar discípulos comprometidos com a Palavra</li>
            <li>Promover comunhão entre as UMADALPEs da região</li>
            <li>Servir com excelência e amor</li>
          </ul>
        </section>

        <section className="card-surface p-5">
          <h2 className="font-display font-semibold text-brand-bluedeep mb-2">Liderança</h2>
          <p className="text-sm text-brand-gray leading-relaxed">
            Nossa diretoria é composta por dirigente, vice-dirigente, secretárias, auxiliares e
            maestros(as) que servem com dedicação a cada culto e evento.
          </p>
        </section>

        <section className="card-surface p-5">
          <h2 className="font-display font-semibold text-brand-bluedeep mb-2">Redes sociais</h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue"
          >
            <Instagram size={18} /> @umadalpe.maranguapeIIbaixo
          </a>
        </section>
      </div>
    </main>
  );
}
