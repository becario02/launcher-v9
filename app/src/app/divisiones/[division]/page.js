// app/division/[division]/page.js
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import {
  Circle,
  Flag,
  ShoppingCart,
  Calculator,
  Monitor,
  Tool,
  BarChart2,
  Settings
} from 'lucide-react'
import { usePrimaryColor } from '@/context/primaryColor'

const divisionModules = {
  nucleares: [
    {
      title: 'Llantas',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Circle,
      slug: 'llantas'
    },
    {
      title: 'Tráfico',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Flag,
      slug: 'trafico'
    },
    {
      title: 'Liquidaciones',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Settings,
      slug: 'liquidaciones'
    },
    {
      title: 'Compras',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: ShoppingCart,
      slug: 'compras'
    },
    {
      title: 'Cotizador',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Calculator,
      slug: 'cotizador'
    },
    {
      title: 'Vigilancia',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Monitor,
      slug: 'vigilancia'
    },
    {
      title: 'Mantenimiento',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Tool,
      slug: 'mantenimiento'
    }
  ],
  financieros: [
    {
      title: 'Contabilidad',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: BarChart2,
      slug: 'contabilidad'
    },
    {
      title: 'Facturación',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Calculator,
      slug: 'facturacion'
    },
    {
      title: 'Presupuestos',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Calculator,
      slug: 'presupuestos'
    }
  ],
  auxiliares: [
    {
      title: 'RRHH',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Circle,
      slug: 'rrhh'
    },
    {
      title: 'Legal',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Circle,
      slug: 'legal'
    },
    {
      title: 'IT',
      description:
        'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
      icon: Settings,
      slug: 'it'
    }
  ]
}

const divisionNames = {
  nucleares: 'Nucleares',
  financieros: 'Financieros',
  auxiliares: 'Auxiliares'
}

export default function DivisionPage() {
  const { division } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { primaryColor } = usePrimaryColor()

  const modules = divisionModules[division] || []
  const divisionName = divisionNames[division] || division

  return (
    <div className="flex">
      {/* Sidebar para pantallas md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar slide-over en móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Área principal */}
      <div className="flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14 overflow-x-hidden">
          {/* Banner de la división */}
          <div
            className="rounded-xl mx-4 sm:mx-6 md:mx-12 lg:mx-[60px] xl:mx-[100px] relative overflow-hidden"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <div
                className="absolute rounded-full w-[400px] h-[400px] right-[-100px] top-[-100px] opacity-5"
                style={{
                  background: `radial-gradient(circle, white 0%, white 100%)`
                }}
              />
              <div
                className="absolute rounded-full w-[300px] h-[300px] right-[0px] top-[-50px] opacity-5"
                style={{
                  background: `radial-gradient(circle, white 0%, white 100%)`
                }}
              />
              <div
                className="absolute rounded-full w-[250px] h-[250px] right-[100px] top-[0px] opacity-5"
                style={{
                  background: `radial-gradient(circle, white 0%, white 100%)`
                }}
              />
            </div>

            <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 h-auto md:h-[150px] flex flex-col justify-center relative z-10">
              <p className="text-[14px] leading-[21px] font-medium font-poppins text-white mb-1">
                División
              </p>
              <h1 className="text-[24px] leading-[0.75] font-semibold font-poppins text-white">
                {divisionName}
              </h1>
            </div>
          </div>

          {/* Grid de módulos */}
          <div className="px-4 sm:px-6 md:px-12 lg:px-[60px] xl:px-[100px] mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {modules.map(mod => (
                <Link
                  key={mod.slug}
                  href={`/divisiones/${division}/${mod.slug}`}
                  className="block cursor-pointer"
                >
                  <ModuleCard
                    title={mod.title}
                    description={mod.description}
                    Icon={mod.icon}
                  />
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ModuleCard({ title, description, Icon }) {
  const IconComponent = Icon || Settings
  const { primaryColor } = usePrimaryColor()

  return (
    <div className="bg-white dark:bg-[#1C1C24] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2C2C38] p-5 hover:shadow-md transition-shadow h-full">
      <div className="flex flex-col h-full">
        <div className="mb-3" style={{ color: primaryColor }}>
          <IconComponent className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm flex-grow">
          {description}
        </p>
      </div>
    </div>
  )
}