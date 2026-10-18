import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "Cómo conseguir el bono de bienvenida de un banco con un código o un enlace de invitación, paso a paso.",
};
export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Elige una promoción",
    text: "En la portada tienes las promociones activas ordenadas por bono. Entra en la que te interese y lee los requisitos: te los explicamos sin letra pequeña.",
  },
  {
    title: "Pulsa «Ver código de invitación»",
    text: "Te damos un código o un enlace listo para usar. No hace falta registrarte en esta web.",
  },
  {
    title: "Abre la cuenta con el código",
    text: "Sigue la guía de la ficha: te decimos a qué web o app ir y en qué momento del alta tienes que meter el código.",
  },
  {
    title: "Cumple los requisitos y cobra",
    text: "Haz lo que pide la entidad (un ingreso, usar la tarjeta, invertir…) dentro del plazo. Después te paga el bono.",
  },
];

export default async function HowItWorks() {
  const { reportThreshold, requireApproval } = await getSettings();
  return (
    <div className="wrap mt-6 max-w-3xl">
      <h1 className="text-[26px] font-extrabold leading-tight sm:text-3xl">Cómo funciona {SITE_NAME}</h1>
      <p className="mt-2 leading-relaxed text-muted">
        Muchos bancos, brokers y fintechs regalan dinero a quien abre una cuenta con la invitación de un cliente. Aquí tienes los códigos y los pasos
        para conseguirlo.
      </p>

      <ol className="mt-6 flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card flex gap-4 p-4 sm:p-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-lg font-extrabold text-ink">{i + 1}</span>
            <div>
              <h2 className="font-bold">{s.title}</h2>
              <p className="mt-1 leading-relaxed text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-8" aria-labelledby="codigo-o-enlace">
        <h2 id="codigo-o-enlace" className="text-xl font-extrabold">¿Te ha salido un código o un enlace?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="card p-4 sm:p-5">
            <p className="badge bg-brand-soft text-brand-dark">Enlace</p>
            <h3 className="mt-2 font-bold">Lo más fácil</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 leading-relaxed">
              <li>Pulsa «Abrir enlace de invitación».</li>
              <li>Haz todo el registro desde ahí, sin salir.</li>
              <li>La invitación queda guardada sola.</li>
            </ol>
            <p className="hint mt-2">En el móvil, el enlace suele abrir la app de la entidad o la tienda para instalarla.</p>
          </div>
          <div className="card p-4 sm:p-5">
            <p className="badge bg-accent-soft text-ink">Código</p>
            <h3 className="mt-2 font-bold">Hay que pegarlo tú</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 leading-relaxed">
              <li>Pulsa «Copiar».</li>
              <li>Abre la web o app oficial con el botón de la ficha.</li>
              <li>Durante el alta, pégalo en el campo «código de amigo», «de invitación» o «promocional».</li>
            </ol>
            <p className="note note-warn mt-3">Mételo antes de terminar el registro: normalmente no se puede añadir después.</p>
          </div>
        </div>
        <p className="hint mt-3">
          Truco para el móvil: copia el código, cambia a la app del banco y mantén pulsado el campo para que aparezca «Pegar».
        </p>
      </section>

      <section className="prose-legal card mt-8 p-4 sm:p-5" aria-labelledby="transparencia">
        <h2 id="transparencia" className="!mt-0">Cómo gana dinero {SITE_NAME}</h2>
        <p>
          Algunos códigos son del propietario de la web. Si abres una cuenta con uno de ellos, la entidad le paga a él su recompensa de invitación,
          igual que pasa cuando te invita un amigo. A ti no te cuesta nada y no reduce tu recompensa. Por defecto, las ofertas se ordenan por
          recompensa; la «opción estrella» la elige el propietario.
        </p>
        <p>
          Cuando los códigos del propietario llegan a su límite de usos, mostramos por turnos los que comparten otros usuarios. Cada código indica
          de quién es.
        </p>
        <h2>Cómo revisamos las ofertas</h2>
        <ul>
          <li>Los datos salen de las condiciones oficiales de cada entidad, que enlazamos en cada oferta.</li>
          <li>La revisión es manual. Cada oferta muestra la fecha de la última comprobación o «Pendiente de verificar» si aún no la hemos revisado.</li>
          <li>Las ofertas con fecha de fin desaparecen solas de las activas al caducar y pasan a «Caducadas».</li>
          <li>
            Si ves una oferta caducada o con algún dato mal, usa el enlace «Avísanos» al final de su ficha. Revisamos cada aviso.
          </li>
          <li>Las opiniones son de personas que han usado las ofertas. Revisamos cada una antes de publicarla y no comprobamos los cobros con las entidades.</li>
        </ul>
      </section>

      <section className="prose-legal card mt-8 p-4 sm:p-5" aria-labelledby="preguntas">
        <h2 id="preguntas" className="!mt-0">Preguntas frecuentes</h2>
        <h3 className="mt-4 font-bold">¿Hay que domiciliar la nómina?</h3>
        <p>No. Las ofertas de {SITE_NAME} son sin nómina: no tienes que cambiar tu nómina de banco para conseguir el regalo.</p>
        <h3 className="mt-4 font-bold">¿De quién son los códigos?</h3>
        <p>
          Primero mostramos los códigos del propietario de {SITE_NAME}, que es como se mantiene la web. Cuando llegan a su límite de usos, mostramos
          por turnos los que comparte la comunidad, siempre el que menos visitas ha recibido. Cada código indica si es «de {SITE_NAME}» o «de la
          comunidad».
        </p>
        <h3 className="mt-4 font-bold">¿Necesito registrarme?</h3>
        <p>
          No para ver promociones ni copiar códigos. Solo si quieres compartir tu propio código: entras con tu email, sin contraseña.
          {requireApproval ? " Revisamos cada código antes de publicarlo." : ""}
        </p>
        <h3 className="mt-4 font-bold">¿Y si un código no funciona?</h3>
        <p>
          Pulsa «Este código no funciona» y después «Dame otro código». Cuando un código de la comunidad recibe {reportThreshold} avisos de personas
          distintas, se oculta automáticamente hasta que lo revisamos.
        </p>
        <h3 className="mt-4 font-bold">Antes de contratar</h3>
        <ul>
          <li>Lee siempre las condiciones oficiales: el enlace está en cada ficha.</li>
          <li>Cumple todos los requisitos y plazos: si falta uno, la entidad puede no pagar el bono.</li>
          <li>Normalmente solo cuenta si nunca has sido cliente de esa entidad.</li>
          <li>Esto no es asesoramiento financiero. Algunas plataformas de inversión tienen riesgo de pérdida.</li>
          <li>Los bonos suelen tributar en la declaración de la renta.</li>
        </ul>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary">Ver promociones</Link>
        <Link href="/mi-panel" className="btn btn-ghost">Compartir mi código</Link>
      </div>
    </div>
  );
}
