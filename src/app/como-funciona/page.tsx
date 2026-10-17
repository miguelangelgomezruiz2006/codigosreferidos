import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Cómo funciona" };
export const dynamic = "force-dynamic";

export default async function HowItWorks() {
  const { reportThreshold, requireApproval } = await getSettings();
  return (
    <div className="wrap mt-6 max-w-3xl">
      <h1 className="text-2xl font-extrabold">Cómo funciona {SITE_NAME}</h1>
      <div className="prose-legal card mt-4 p-5">
        <h2>¿Qué es un código de invitación?</h2>
        <p>
          Muchos bancos, brokers y fintechs regalan dinero a quien abre una cuenta con el código de un cliente actual. Normalmente ganáis los dos:
          tú recibes el bono de bienvenida y quien te invita, su recompensa.
        </p>
        <h2>¿De quién son los códigos?</h2>
        <p>
          Primero mostramos los códigos del propietario de {SITE_NAME}, que es como se mantiene la web. Cuando esos códigos llegan a su límite de
          usos, mostramos por turnos los códigos que comparte la comunidad: siempre el que menos visitas ha recibido, para que el reparto sea
          justo. Cada código indica si es «de {SITE_NAME}» o «de la comunidad».
        </p>
        <h2>¿Necesito registrarme?</h2>
        <p>
          No para ver promociones ni copiar códigos. Solo si quieres compartir tu propio código: entras con tu email, sin contraseña.
          {requireApproval ? " Revisamos cada código antes de publicarlo." : ""}
        </p>
        <h2>¿Y si un código no funciona?</h2>
        <p>
          Pulsa «Este código no funciona» y después «Dame otro código». Cuando un código de la comunidad recibe {reportThreshold} avisos de personas
          distintas, se oculta automáticamente hasta que lo revisamos.
        </p>
        <h2>Antes de contratar</h2>
        <ul>
          <li>Lee siempre las condiciones oficiales: el enlace está en cada ficha.</li>
          <li>Cumple todos los requisitos y plazos: si falta uno, la entidad puede no pagar el bono.</li>
          <li>Esto no es asesoramiento financiero. Algunas plataformas de inversión tienen riesgo de pérdida.</li>
          <li>Los bonos suelen tributar en la declaración de la renta.</li>
        </ul>
      </div>
      <p className="mt-6">
        <Link href="/" className="btn btn-primary">Ver promociones</Link>
      </p>
    </div>
  );
}
