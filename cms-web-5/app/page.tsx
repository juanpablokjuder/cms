import PageLoader from '@/components/PageLoader'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Servicios from '@/components/Servicios'
import SobreNosotros from '@/components/SobreNosotros'
import Noticias from '@/components/Noticias'
import Contacto from '@/components/Contacto'
import Footer from '@/components/Footer'
import HowItWorks from '@/components/ComoFunciona'
import SectionVideo from '@/components/SectionVideo'
import ModuloCarruselImagenes from '@/components/ModuloCarruselImagenes'
export default function Home() {
  return (
    <>
      <main>
      <Navbar />
      <Hero />
      <Servicios />
      <HowItWorks />
      <SobreNosotros />
      <Noticias />
      <Contacto />
      <SectionVideo />
      <ModuloCarruselImagenes />
      <Footer />
      </main>
    </>
  )
}
