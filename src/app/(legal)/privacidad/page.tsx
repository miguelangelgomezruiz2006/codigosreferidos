import type { Metadata } from "next";
import { getSettings, legalValue } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacidad" };
export const dynamic = "force-dynamic";

export default async function Privacy() {
  const s = await getSettings();
  return (
    <>
      <h1 className="text-2xl font-extrabold">Política de privacidad</h1>
      <div className="prose-legal card mt-4 p-5">
        <p className="note note-warn">Texto base pendiente de revisión por un profesional antes de publicar la web.</p>
        <h2>Responsable</h2>
        <p>
          {legalValue(s.ownerName, "nombre del titular")} · NIF {legalValue(s.ownerNif, "NIF del titular")} · {legalValue(s.contactEmail, "email de contacto")}
        </p>
        <h2>Qué datos tratamos</h2>
        <ul>
          <li>Si visitas la web sin cuenta: una cookie técnica anónima y una huella cifrada de tu conexión para evitar abusos. No guardamos tu IP.</li>
          <li>Si creas una cuenta: tu email y los códigos de invitación que compartes.</li>
        </ul>
        <h2>Para qué</h2>
        <ul>
          <li>Enviarte el enlace para entrar y gestionar tus códigos.</li>
          <li>Mostrar tus códigos a otros visitantes y contar cuántas veces se copian.</li>
          <li>Proteger la web frente a abusos.</li>
        </ul>
        <h2>Base legal</h2>
        <p>La ejecución del servicio que pides al crear tu cuenta y el interés legítimo en mantener la web segura.</p>
        <h2>Cuánto tiempo</h2>
        <p>Mientras tengas cuenta. Puedes borrar tus códigos cuando quieras desde tu panel y pedir la baja escribiendo al email de contacto.</p>
        <h2>Tus derechos</h2>
        <p>
          Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a {legalValue(s.contactEmail, "email de contacto")}.
          También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
        </p>
        <h2>Proveedores</h2>
        <p>Alojamiento web y base de datos, y un servicio de envío de emails. No vendemos tus datos ni los cedemos con fines publicitarios.</p>
      </div>
    </>
  );
}
