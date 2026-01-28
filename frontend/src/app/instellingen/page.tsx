import Link from 'next/link';

const SETTINGS_LINKS = [
  {
    title: 'Onboarding',
    description: 'Start of hervat de VVE onboarding flow.',
    href: '/instellingen/onboarding',
  },
  {
    title: 'Rollen',
    description: 'Beheer rollen en toegang binnen de VVE.',
    href: '/instellingen/rollen',
  },
  {
    title: 'Splitsingssleutel',
    description: 'Definieer de aandelen per unit.',
    href: '/instellingen/splitsingssleutel',
  },
  {
    title: 'Splitsingsakte',
    description: 'Beheer versies van de splitsingsakte.',
    href: '/instellingen/splitsingsakte',
  },
  {
    title: 'E-mail',
    description: 'Configureer e-mailinstellingen en templates.',
    href: '/instellingen/email',
  },
  {
    title: 'Notificaties',
    description: 'Stel meldingen en voorkeuren in.',
    href: '/instellingen/notificaties',
  },
  {
    title: 'Leveranciers',
    description: 'Beheer leveranciers en evaluaties.',
    href: '/instellingen/leveranciers',
  },
  {
    title: 'Export & backup',
    description: 'Exporteer data en beheer back-ups.',
    href: '/instellingen/export-backup',
  },
  {
    title: 'Abonnementen',
    description: 'Bekijk en beheer abonnementen.',
    href: '/instellingen/abonnementen',
  },
];

export default function InstellingenPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Instellingen</h1>
        <p className="text-gray-600">
          Beheer alle VVE-instellingen vanaf één plek.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900">{link.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
