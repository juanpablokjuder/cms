'use client'

import { useState, type FormEvent } from 'react'
import ScrollReveal from './ScrollReveal'

const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'hola@disenhosvk.com',
    href: 'mailto:hola@disenhosvk.com',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'WhatsApp',
    value: '+54 9 11 0000-0000',
    href: 'https://wa.me/5491100000000',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Ubicación',
    value: 'Buenos Aires, Argentina',
    href: '#',
  },
]

const PROJECT_TYPES = [
  'Sitio web corporativo',
  'Tienda online / E-commerce',
  'Landing page',
  'Aplicación web',
  'Rediseño de sitio existente',
  'SEO y posicionamiento',
  'Soporte técnico',
  'Otro',
]

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

function InputIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600 pointer-events-none">
      {children}
    </div>
  )
}

export default function Contacto() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [form, setForm] = useState({ name: '', email: '', phone: '', projectType: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    await new Promise((r) => setTimeout(r, 1200))
    setStatus('success')
  }

  const inputBase =
    'w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#060F1E] border border-slate-200 dark:border-[rgba(0,200,248,0.1)] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 rounded-xl text-sm focus:outline-none focus:border-vk/60 focus:ring-2 focus:ring-vk/15 transition-all duration-200'

  return (
    <section
      id="contacto"
      className="py-20 sm:py-32 bg-[#F5F9FF] dark:bg-[#040D1A] border-t border-slate-100 dark:border-vk/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-vk text-sm font-semibold tracking-widest uppercase mb-3">
              Hablemos
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              ¿Tenés un <span className="text-gradient">proyecto</span> en mente?
            </h2>
            <p className="text-slate-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Contanos tu idea y te responderemos en menos de 24 hs con una propuesta a medida.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* ── Contact info sidebar ── */}
          <ScrollReveal direction="left" className="lg:col-span-2">
            <div className="flex flex-col gap-4">

              {/* Info cards */}
              {CONTACT_INFO.map(({ icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="group flex items-center gap-4 bg-white dark:bg-[rgba(10,22,40,0.6)] border border-slate-100 dark:border-[rgba(0,200,248,0.07)] rounded-2xl p-4 hover:border-vk/25 hover:shadow-[0_4px_24px_rgba(0,200,248,0.06)] transition-all duration-200"
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-vk/8 dark:bg-vk/10 border border-vk/15 dark:border-vk/20 flex items-center justify-center text-vk group-hover:bg-vk/15 transition-colors">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-400 dark:text-gray-500 text-xs font-medium mb-0.5">{label}</div>
                    <div className="text-slate-700 dark:text-white font-semibold text-sm truncate group-hover:text-vk transition-colors">
                      {value}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-200 dark:text-gray-700 group-hover:text-vk ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}

              {/* Availability badge */}
              <div className="bg-white dark:bg-[rgba(10,22,40,0.6)] border border-slate-100 dark:border-[rgba(0,200,248,0.07)] rounded-2xl p-5 mt-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-emerald-500 dark:text-emerald-400 text-sm font-bold">Disponible ahora</span>
                </div>
                <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                  Respondemos de lunes a viernes de 9 a 18 hs (GMT-3). Fuera del horario, al día siguiente hábil.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-[rgba(0,200,248,0.08)] overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-vk to-vk-light" />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-gray-500 flex-shrink-0">80% de capacidad disponible</span>
                </div>
              </div>

            </div>
          </ScrollReveal>

          {/* ── Form ── */}
          <ScrollReveal direction="right" delay={120} className="lg:col-span-3">
            <div>
              {status === 'success' ? (
                <div className="bg-white dark:bg-[rgba(10,22,40,0.8)] border border-vk/15 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                  <div className="h-1.5 w-full bg-gradient-to-r from-vk to-vk-light" />
                  <div className="p-10 sm:p-14 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-vk/10 border border-vk/25 flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8 text-vk" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-black text-2xl mb-2">¡Mensaje enviado!</h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">
                      Gracias por escribirnos. Te responderemos dentro de las próximas 24 horas.
                    </p>
                    <button
                      onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', projectType: '', message: '' }) }}
                      className="inline-flex items-center gap-2 text-vk text-sm font-semibold hover:text-vk-light transition-colors"
                    >
                      Enviar otro mensaje
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[rgba(10,22,40,0.8)] border border-slate-100 dark:border-[rgba(0,200,248,0.1)] rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                  {/* Gradient accent bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-vk to-vk-light" />

                  <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-5" noValidate>

                    {/* Form heading */}
                    <div className="mb-1">
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg">Cuéntanos sobre tu proyecto</h3>
                      <p className="text-slate-400 dark:text-gray-500 text-sm mt-0.5">Todos los campos con * son obligatorios.</p>
                    </div>

                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-slate-600 dark:text-gray-300 text-sm font-medium">
                          Nombre completo <span className="text-vk">*</span>
                        </label>
                        <div className="relative">
                          <InputIcon>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </InputIcon>
                          <input id="name" name="name" type="text" required value={form.name}
                            onChange={handleChange} placeholder="Juan García" className={inputBase} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-slate-600 dark:text-gray-300 text-sm font-medium">
                          Email <span className="text-vk">*</span>
                        </label>
                        <div className="relative">
                          <InputIcon>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </InputIcon>
                          <input id="email" name="email" type="email" required value={form.email}
                            onChange={handleChange} placeholder="juan@empresa.com" className={inputBase} />
                        </div>
                      </div>
                    </div>

                    {/* Project type */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="projectType" className="text-slate-600 dark:text-gray-300 text-sm font-medium">
                        Tipo de proyecto <span className="text-vk">*</span>
                      </label>
                      <div className="relative">
                        <InputIcon>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </InputIcon>
                        <select
                          id="projectType" name="projectType" required value={form.projectType}
                          onChange={handleChange}
                          className={`${inputBase} appearance-none pr-10 cursor-pointer`}
                        >
                          <option value="" disabled>Seleccioná una opción...</option>
                          {PROJECT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {/* Chevron */}
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 dark:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-slate-600 dark:text-gray-300 text-sm font-medium">
                        Teléfono / WhatsApp
                        <span className="ml-2 text-slate-400 dark:text-gray-500 font-normal text-xs">(opcional)</span>
                      </label>
                      <div className="relative">
                        <InputIcon>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </InputIcon>
                        <input id="phone" name="phone" type="tel" value={form.phone}
                          onChange={handleChange} placeholder="+54 9 11 0000-0000" className={inputBase} />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="message" className="text-slate-600 dark:text-gray-300 text-sm font-medium">
                        Descripción del proyecto <span className="text-vk">*</span>
                      </label>
                      <textarea
                        id="message" name="message" required rows={5} value={form.message}
                        onChange={handleChange}
                        placeholder="Contanos en qué consiste tu proyecto, tus objetivos, plazos y cualquier detalle relevante..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#060F1E] border border-slate-200 dark:border-[rgba(0,200,248,0.1)] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 rounded-xl text-sm focus:outline-none focus:border-vk/60 focus:ring-2 focus:ring-vk/15 transition-all duration-200 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full bg-gradient-to-r from-vk to-vk-light text-[#030A14] font-bold py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 text-base flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(0,200,248,0.3)] hover:shadow-[0_6px_32px_rgba(0,200,248,0.4)]"
                    >
                      {status === 'sending' ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Enviando consulta...
                        </>
                      ) : (
                        <>
                          Enviar consulta
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-400 dark:text-gray-600">
                      Al enviar aceptás nuestra{' '}
                      <a href="#" className="text-vk hover:underline">política de privacidad</a>.
                      Nunca compartiremos tus datos.
                    </p>

                  </form>
                </div>
              )}
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  )
}
