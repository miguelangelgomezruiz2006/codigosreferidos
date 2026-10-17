/**
 * Cómo darse de alta en cada entidad y en qué momento se mete el código de amigo.
 * Se usa en la ficha de la promoción, sobre todo cuando el código no trae enlace:
 * así el visitante sabe a dónde ir y cuándo pegarlo.
 *
 * Para añadir una entidad, usa su `slug` (el mismo de Administración › Entidades).
 * Si una entidad no está aquí, la ficha usa su web oficial y un texto genérico.
 */

export interface SignupGuide {
  /** Página oficial para hacerse cliente (no es un enlace de referido). */
  signupUrl: string;
  /** Texto del botón. */
  signupLabel: string;
  /** Dónde se abre la cuenta: web, app o las dos. */
  where: string;
  /** Cuándo pedirá el código el formulario de alta. */
  codeMoment: string;
}

export const SIGNUP_GUIDES: Record<string, SignupGuide> = {
  imagin: {
    signupUrl: "https://www.imagin.com",
    signupLabel: "Ir a imagin",
    where: "El alta se hace desde la app de imagin.",
    codeMoment:
      "Si usas el enlace, el código ya va dentro. Si no, pégalo al final del alta, cuando pregunte «¿Tienes algún código promocional?»: después no se puede añadir.",
  },
  openbank: {
    signupUrl: "https://www.openbank.es/get-app?language=OK_ES/es-ES",
    signupLabel: "Descargar la app de Openbank",
    where: "El alta se hace desde la app de Openbank (también desde openbank.es).",
    codeMoment:
      "Pega el código en el campo «Código de amigo» o «Código promocional» que aparece durante el alta, antes de terminar el registro.",
  },
  bbva: {
    signupUrl: "https://www.bbva.es/general/hazte-cliente/abrir-cuenta-bancaria-online.html",
    signupLabel: "Ir a «Hazte cliente» de BBVA",
    where: "Puedes abrir la Cuenta Online desde bbva.es o desde la app de BBVA.",
    codeMoment:
      "Pega el código cuando el formulario te pregunte si tienes un código de invitación, durante el alta. Elige la Cuenta Online y la tarjeta Aqua.",
  },
  myinvestor: {
    signupUrl: "https://myinvestor.es",
    signupLabel: "Ir a la web de MyInvestor",
    where: "El alta es digital, en la web o la app de MyInvestor.",
    codeMoment: "Si usas el enlace, el código ya va dentro. Si no, pégalo en el campo de código promocional al empezar el alta.",
  },
  kraken: {
    signupUrl: "https://www.kraken.com/sign-up",
    signupLabel: "Ir al registro de Kraken",
    where: "El registro se hace en kraken.com o en la app de Kraken.",
    codeMoment: "Si usas el enlace, el código ya va dentro. Si no, pégalo en el campo de código de invitación al crear la cuenta.",
  },
  mintos: {
    signupUrl: "https://www.mintos.com",
    signupLabel: "Ir a la web de Mintos",
    where: "El registro se hace en mintos.com o en la app.",
    codeMoment: "Si usas el enlace, el código ya va dentro. Si no, pégalo en el campo de código de invitación del registro.",
  },
};

export function guideFor(entity: { slug: string; name: string; website: string }): SignupGuide {
  return (
    SIGNUP_GUIDES[entity.slug] ?? {
      signupUrl: entity.website,
      signupLabel: `Ir a la web de ${entity.name}`,
      where: `El alta se hace en la web o la app oficial de ${entity.name}.`,
      codeMoment: "Pega el código en el campo de código de amigo, de invitación o promocional que aparece durante el alta.",
    }
  );
}
