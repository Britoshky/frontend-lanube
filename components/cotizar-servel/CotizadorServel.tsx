"use client";
import { useState } from "react";

const preciosSpot = {
  15: 2200,
  30: 4400,
  45: 6600,
  60: 8800,
};

const preciosEntrevista = {
  15: 99000,
  30: 198000,
};

export default function CotizadorServel() {
  const [tipo, setTipo] = useState("spot");
  const [segundos, setSegundos] = useState(15);
  const [vecesPorDia, setVecesPorDia] = useState<string>("1");
  const [dias, setDias] = useState<string>("1");
  const [minutosEntrevista, setMinutosEntrevista] = useState(15);

  let total = 0;
  let mostrarTotal = false;
  if (tipo === "spot") {
    const veces = Number(vecesPorDia);
    const diasNum = Number(dias);
    mostrarTotal = !!segundos && veces > 0 && diasNum > 0;
    if (mostrarTotal) {
      total = preciosSpot[String(segundos) as unknown as keyof typeof preciosSpot] * veces * diasNum;
    }
  } else {
    const diasNum = Number(dias);
    mostrarTotal = !!minutosEntrevista && diasNum > 0;
    if (mostrarTotal) {
      total = preciosEntrevista[String(minutosEntrevista) as unknown as keyof typeof preciosEntrevista] * diasNum;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-md font-semibold border ${tipo === "spot" ? "bg-sky-700 text-white" : "bg-gray-100 text-sky-700"}`}
          onClick={() => setTipo("spot")}
        >
          Spot Radial
        </button>
        <button
          className={`px-4 py-2 rounded-md font-semibold border ${tipo === "entrevista" ? "bg-sky-700 text-white" : "bg-gray-100 text-sky-700"}`}
          onClick={() => setTipo("entrevista")}
        >
          Entrevista
        </button>
      </div>

      {tipo === "spot" ? (
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Duración del spot</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={segundos}
              onChange={e => setSegundos(Number(e.target.value))}
            >
              <option value={15}>15 segundos ($2.200)</option>
              <option value={30}>30 segundos ($4.400)</option>
              <option value={45}>45 segundos ($6.600)</option>
              <option value={60}>1 minuto ($8.800)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Veces por día</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-md px-3 py-2"
              value={vecesPorDia}
              onChange={e => setVecesPorDia(e.target.value.replace(/^0+/, ""))}
              placeholder="Veces por día"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Cantidad de días</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-md px-3 py-2"
              value={dias}
              onChange={e => setDias(e.target.value.replace(/^0+/, ""))}
              placeholder="Cantidad de días"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Duración de la entrevista</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={minutosEntrevista}
              onChange={e => setMinutosEntrevista(Number(e.target.value))}
            >
              <option value={15}>15 minutos ($99.000)</option>
              <option value={30}>30 minutos ($198.000)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Cantidad de días</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-md px-3 py-2"
              value={dias}
              onChange={e => setDias(e.target.value.replace(/^0+/, ""))}
              placeholder="Cantidad de días"
            />
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        {mostrarTotal ? (
          <span className="text-lg font-bold text-purple-700">Total: ${total.toLocaleString("es-CL")}</span>
        ) : (
          <span className="text-lg text-gray-500">Completa todos los campos para ver el total</span>
        )}
      </div>

      <div className="mt-8 mx-auto max-w-lg bg-gradient-to-br from-sky-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6 shadow-lg text-left">
        <h2 className="text-xl font-bold text-purple-700 mb-3">Detalles de precios</h2>
        <ul className="mb-4 text-base text-gray-800 list-disc pl-5">
          <li>Spot radial de 15 segundos: <span className="font-semibold text-sky-700">$2.200</span></li>
          <li>Spot radial de 30 segundos: <span className="font-semibold text-sky-700">$4.400</span></li>
          <li>Spot radial de 45 segundos: <span className="font-semibold text-sky-700">$6.600</span></li>
          <li>Spot radial de 1 minuto: <span className="font-semibold text-sky-700">$8.800</span></li>
          <li>Entrevista de 15 minutos: <span className="font-semibold text-sky-700">$99.000</span></li>
          <li>Entrevista de 30 minutos: <span className="font-semibold text-sky-700">$198.000</span></li>
        </ul>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded text-sm text-yellow-900 font-medium mb-4">
          <span className="block mb-1">Estos precios sólo serán válidos para la franja electoral de presidentes, diputados y senadores año 2025.</span>
        </div>
        <div className="text-center mt-4">
          <a
            href="https://tarifas.servel.cl/visualizar/80c385b7ec23ba5866d8d5ff1d1a8dbf4b1765c9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-purple-700 text-white rounded-lg font-semibold shadow hover:bg-purple-800 transition"
          >
            Ver precios oficiales en Servel
          </a>
        </div>
      </div>
    </div>
  );
}
