import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookies" };

export default function Cookies() {
  return (
    <>
      <h1 className="text-2xl font-extrabold">Política de cookies</h1>
      <div className="prose-legal card mt-4 p-5">
        <p>Esta web solo usa cookies técnicas, imprescindibles para que funcione. No usamos cookies de publicidad ni de analítica, por eso no te pedimos permiso.</p>
        <table className="table mt-3">
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Para qué sirve</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>vid</td>
              <td>Identificador anónimo para mostrarte siempre el mismo código y contar usos reales.</td>
              <td>1 año</td>
            </tr>
            <tr>
              <td>authjs.*</td>
              <td>Mantener tu sesión si entras con tu email.</td>
              <td>30 días</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">Si en el futuro añadimos analítica o publicidad, te pediremos permiso antes.</p>
      </div>
    </>
  );
}
