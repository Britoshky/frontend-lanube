import CompromisoComunitario from '@/components/quienes-somos/CompromisoComunitario'
import EquipoRadio from '@/components/quienes-somos/EquipoRadio'
import HistoriaRadio from '@/components/quienes-somos/HistoriaRadio'
import IntroQuienesSomos from '@/components/quienes-somos/IntroQuienesSomos'
import ValoresRadio from '@/components/quienes-somos/ValoresRadio'
import React from 'react'

export default function pageQuienesSomos() {
  return (
    <div>
      <IntroQuienesSomos />
    <ValoresRadio />
    <EquipoRadio />
    <HistoriaRadio />
    <CompromisoComunitario />
    </div>
  )
}
