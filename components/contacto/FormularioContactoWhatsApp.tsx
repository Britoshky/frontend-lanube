"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function FormularioContactoWhatsApp() {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");

  const enviarWhatsApp = () => {
    const texto = `Hola, soy ${nombre} y me gustaría contactar a Radio La Nube. Mi mensaje es: ${mensaje}`;
    const url = `https://wa.me/56926261971?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="bg-gradient-to-br from-sky-100 to-purple-100 py-20 px-6 md:px-10 lg:px-20">
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-sky-800">
          Envíanos un Mensaje
        </h2>
        <p className="text-gray-700 text-lg">
          Completa el siguiente formulario y te responderemos lo antes posible vía WhatsApp.
        </p>

        <div className="space-y-6 text-left">
          <div>
            <Label htmlFor="nombre" className="text-sky-900">Tu Nombre</Label>
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
