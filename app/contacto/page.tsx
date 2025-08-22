import FormularioContactoWhatsApp from '@/components/contacto/FormularioContactoWhatsApp'
import InfoContacto from '@/components/contacto/InfoContacto'
import { Metadata } from 'next';
import React from 'react'

export const metadata : Metadata = {
  title: "Contacto | Radio La Nube 99.5 FM",
  description:
    "¿Quieres escribirnos, pautar publicidad o enviarnos música? Contáctanos por WhatsApp, correo o redes sociales.",
  keywords: [
    "contacto radio",
    "publicidad radial",
    "enviar música radio",
    "radio La Nube contacto",
    "contactar emisora",
    "radio Chanco",
    "radio juvenil Chile"
  ],
  openGraph: {
    title: "Contacto | Radio La Nube 99.5 FM",
    description:
      "Conéctate con Radio La Nube por WhatsApp, correo o redes. Estamos en Chanco, Región del Maule.",
    url: "https://lanubefm.cl/contacto",
    siteName: "Radio La Nube",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    title: "Contacto | Radio La Nube 99.5 FM",
    description:
      "¿Tienes un mensaje para nosotros? Escríbenos por WhatsApp, email o redes sociales.",
    card: "summary_large_image",
  },
};


export default function pageContacto() {
  return (
    <main>
      {/* Información de contacto */}
      <section id="informacion-contacto">
        <InfoContacto />
      </section>

      {/* Formulario de contacto vía WhatsApp */}
      <section id="formulario-contacto">
        <FormularioContactoWhatsApp />
      </section>
    </main>
  );
}