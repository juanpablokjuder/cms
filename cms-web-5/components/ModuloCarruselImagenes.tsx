"use client"
import ScrollReveal from './ScrollReveal'
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
export default function ModuloCarruselImagenes() {
  const data = {
    titulo: "Nuestros clientes",
    cantidad_filas: 2,
    imagenes: [
      {
        nombre: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRisxNQRnDWbkjuWjrxEgGWS7Sn_-xUJ9hxAw&s",
        alt: "Cliente 1",
        url: "https://cliente1.com"
      },
      {
        nombre: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRisxNQRnDWbkjuWjrxEgGWS7Sn_-xUJ9hxAw&s",
        alt: "Cliente 1",
        url: "https://cliente1.com"
      },
      {
        nombre: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRisxNQRnDWbkjuWjrxEgGWS7Sn_-xUJ9hxAw&s",
        alt: "Cliente 1",
        url: "https://cliente1.com"
      }
    ]
  }
  if (!data) return null;

  // Duplicamos los datos para crear loop infinito
  const loopedData = [...data.imagenes, ...data.imagenes, ...data.imagenes, ...data.imagenes, ...data.imagenes, ...data.imagenes, ...data.imagenes];

  return (
    <section 
      className="py-24 sm:py-32 bg-[#EBF4FF] dark:bg-[#060F1E] border-t border-slate-100 dark:border-vk/5"
    >
      <div className="w-full h-[fit-content]">
          <ScrollReveal>
            <div
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >

                   <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
                     <div>
                       <span className="inline-block text-vk text-sm font-semibold tracking-widest uppercase mb-3">
                         Blog & Novedades
                       </span>
                       <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                         Últimas <span className="text-gradient">noticias</span>
                       </h2>
                     </div>
                   </div>
            </div>

          </ScrollReveal>
        <div className="w-full h-full overflow-hidden">
        {[...Array(data.cantidad_filas)].map((_, index) => (
          index % 2 === 0 ? (
            <div className={`overflow-hidden mt-4 ${data.cantidad_filas-1 == index ? 'mb-4' : ''}`}   key={index}>
              <div className="flex animate-slide">
                {loopedData.map((item: any, i: number) => {
                  return (
                  ""
                )})}
              </div>
            </div>
          ) : (
            <div className={`overflow-hidden mt-4 ${data.cantidad_filas-1 == index ? 'mb-4' : ''}`} key={index}>
              <div className="flex animate-slide2">
                {loopedData.slice().reverse().map((item: any, i: number) => (
                  <a
                    href={item.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    key={i}
                    className="w-[100px] h-[100px] lg:w-[230px] lg:h-[230px]  mx-2 bg-gray-800 overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div className="aspect-square">
                      <img
                        src={item.nombre}
                        alt={item.alt}
                        className="w-[100px] h-[100px] lg:w-[230px] lg:h-[230px] object-cover"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
      ))}
      </div>
        
        <style jsx>{`
          .animate-slide {
            display: flex;
            width: max-content;
            animation: slide 50s linear infinite;
          }

          @keyframes slide {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%); /* mueve la mitad, porque duplicamos las tarjetas */
            }
          }
          .animate-slide2 {
            display: flex;
            width: max-content;
            animation: slide2 50s linear infinite;
          }

          @keyframes slide2 {
            0% {
              transform: translateX(-50%); /* empieza en la izquierda */
            }
            100% {
              transform: translateX(0); /* termina en la posición original */
            }
          }
        `}
        </style>
      </div>
    </section>
  );
}
