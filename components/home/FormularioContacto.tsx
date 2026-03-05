"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function FormularioContacto() {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");

  const enviarWhatsApp = () => {
    const texto = `Hola, soy ${nombre} y me gustaría contactar a Radio La Nube. Mi mensaje es: ${mensaje}`;
    const url = `https://wa.me/56926261971?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <section id="contacto" className="w-full bg-white py-20 px-6 md:px-10 lg:px-20">
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-sky-700">
            Contáctanos
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            ¿Tienes preguntas, quieres pautar publicidad o simplemente saludar? Escríbenos:
          </p>
        </div>

        <div className="space-y-6 text-left">
          <div>
            <Label htmlFor="nombre" className="text-sky-900">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Camila Rodríguez"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="mensaje" className="text-sky-900">Mensaje</Label>
            <Textarea
              id="mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={4}
              className="mt-1"
            />
          </div>

          <Button
            onClick={enviarWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="mr-2 h-5 w-5" />
            Enviar por WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
