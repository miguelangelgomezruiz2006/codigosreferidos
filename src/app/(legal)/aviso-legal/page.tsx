import type { Metadata } from "next";
import { getSettings, legalValue } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Aviso legal" };
export const dynamic = "force-dynamic";

export default async function LegalNotice() {
  const s = await getSettings();
  return (
    <>
      <h1 className="text-2xl font-extrabold">Aviso legal</h1>
      <div className="prose-legal card mt-4 p-5">
        <h2>Titular de la web</h2>
        <ul>
          <li>Titular: {legalValue(s.ownerName, "nombre del titular")}</li>
          <li>NIF: {legalValue(s.ownerNif, "NIF del titular")}</li>
          <li>Domicilio: {legalValue(s.ownerAddress, "domicilio del titular")}</li>
          <li>Contacto: {legalValue(s.contactEmail, "email de contacto")}</li>
        </ul>
        <h2>Qué es {SITE_NAME}</h2>
        <p>
          {SITE_NAME} recopila información pública sobre promociones de bienvenida de entidades financieras y muestra códigos de invitación propios
          y de usuarios. No es una entidad financiera, no comercializa productos financieros y no presta asesoramiento financiero.
        </p>
        <h2>Información de las promociones</h2>
        <p>
          Las condiciones de cada promoción las fija la entidad y pueden cambiar en cualquier momento. La información de esta web es orientativa:
          antes de contratar, consulta siempre las condiciones oficiales enlazadas en cada ficha.
        </p>
        <h2>Códigos de invitación</h2>
        <p>
          Algunos códigos pertenecen al titular de la web, que puede recibir una recompensa de la entidad cuando se usan. Los códigos de la comunidad
          son responsabilidad de quien los publica.
        </p>
        <h2>Marcas</h2>
        <p>Los nombres y marcas de las entidades pertenecen a sus titulares y se citan solo para identificar sus promociones.</p>
      </div>
    </>
  );
}
