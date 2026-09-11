import type { EventState, Guest, KeyAttendance } from "@/lib/models";

const firstNames = [
  "Valentina", "Mateo", "Sofía", "Agustín", "Martina", "Santiago", "Camila", "Nicolás",
  "Julieta", "Tomás", "Florencia", "Joaquín", "Lucía", "Franco", "Victoria", "Federico",
  "Malena", "Ignacio", "Delfina", "Bautista", "Pilar", "Lautaro", "Josefina", "Felipe",
  "Micaela", "Juan", "Renata", "Benjamín", "Catalina", "Facundo", "Emilia", "Ramiro",
  "Clara", "Simón", "Paula", "Bruno", "Manuela", "Gonzalo", "Olivia", "Marcos",
  "Milagros", "Leandro", "Rocío", "Emiliano", "Antonella", "Lucas", "Carolina", "Thiago",
  "Belén", "Andrés", "Ailén", "Guillermo", "Noelia", "Damián", "Maite", "Alejandro",
  "Lola", "Sebastián", "Eva", "Maximiliano", "Abril", "Rodrigo", "Alma", "Cristian",
];

const surnames = [
  "Sosa", "Rodríguez", "Pereira", "Navarro", "Silva", "López", "Fernández", "Viera",
  "Acosta", "Giménez", "Suárez", "Méndez", "Cabrera", "Rossi", "Torres", "Olivera",
];

const comments: Record<number, string> = {
  0: "Llego directo después del trabajo.",
  3: "Guarden una porción de muzza.",
  9: "Voy a Peatonal, después confirmo Key.",
  16: "Vegetariana si puede ser.",
  24: "Caigo cerca de las diez.",
  37: "Nos vemos en la previa.",
};

const plusOneNames = [
  "Luciano Costa", "Mora Benítez", "Ana Ferreira", "Pedro Núñez", "Lara Iglesias",
  "Manuel Castro", "Cecilia Ramos", "Iván Duarte", "Mila Arias", "Nacho Perdomo", "Cata Rey",
];

function keyAttendance(index: number): KeyAttendance {
  if (index >= 52) return index < 58 ? "no" : null;
  if (index < 38) return "yes";
  return index % 2 === 0 ? "maybe" : "no";
}

export function createSeedGuests(): Guest[] {
  return firstNames.map((firstName, index) => {
    const isConfirmed = index < 52;
    const isDeclined = index >= 52 && index < 58;
    const hasPlusOne = index < plusOneNames.length;
    const day = String(7 + (index % 3)).padStart(2, "0");
    const hour = String(18 + (index % 5)).padStart(2, "0");
    const minute = String((index * 7) % 60).padStart(2, "0");

    const respondedAt = index < 58 ? `2026-09-${day}T${hour}:${minute}:00.000Z` : null;
    return {
      id: `guest-${String(index + 1).padStart(3, "0")}-seed`,
      guestNumber: index + 1,
      fullName: `${firstName} ${surnames[index % surnames.length]}`,
      attendingPeatonal: isConfirmed ? true : isDeclined ? false : null,
      attendingKey: keyAttendance(index),
      hasPlusOne: isConfirmed && hasPlusOne,
      plusOneName: isConfirmed && hasPlusOne ? plusOneNames[index] : "",
      comment: comments[index] ?? "",
      respondedAt,
      createdAt: respondedAt ?? "2026-09-06T12:00:00.000Z",
      updatedAt: respondedAt ?? "2026-09-06T12:00:00.000Z",
    };
  });
}

export function createDefaultState(): EventState {
  return {
    guests: createSeedGuests(),
    content: {
      heroLabel: "Birthday night",
      heroTitle: "Buenas, te invito a mi cumple 🎉",
      heroBody:
        "La idea es juntarnos temprano en Peatonal, de 21:00 a 01:00. Pongo unas pizzas y unas birras para picar y festejar tranquilos. Después de la 1, el que tenga ganas sigue para Key.",
      heroPrimaryCta: "Confirmar asistencia",
      heroSecondaryCta: "Ver el plan",
      peatonal: {
        title: "Primera parada: Peatonal",
        copy: "Pongo unas pizzas y unas birras para picar y arrancar la noche tranquilos.",
        dateLabel: "Sábado 19 de septiembre",
        startTime: "21:00",
        endTime: "01:00",
        timeLabel: "21:00 — 01:00 hs",
        venue: "Peatonal Pizza & Bar",
        address: "Av. Corrientes 1450, CABA",
        showMap: true,
        directionsLabel: "Cómo ir",
        visible: true,
      },
      key: {
        title: "Después: Key",
        copy: "Después de la 1, el que quiera seguir, sigue. No hace falta que vayas a las dos partes: anotate a lo que te pinte.",
        dateLabel: "Misma noche",
        startTime: "01:00",
        endTime: "",
        timeLabel: "01:00 hs en adelante",
        venue: "Key Club",
        address: "Costanera Norte, CABA",
        showMap: false,
        directionsLabel: "Ver ubicación",
        visible: true,
      },
      rsvpTitle: "¿Venís?",
      rsvpHelper: "Confirmame así puedo calcular bien comida, bebida y cantidad de gente.",
      rsvpSubmitLabel: "Confirmar asistencia",
      rsvpSuccessTitle: "¡Pronto! Quedaste anotado 🎉",
      rsvpSuccessBody: "Gracias por confirmar. Si después cambia algo, avisame.",
    },
    settings: {
      eventName: "Cumpleaños Nahuel - B-Day Night",
      eventDate: "2026-09-19",
      cityLabel: "CABA",
      timezone: "GMT-3 (Buenos Aires / Montevideo)",
      peatonal: {
        venue: "Peatonal Pizza & Bar",
        address: "Av. Corrientes 1450, CABA",
        latitude: "-34.6037",
        longitude: "-58.3816",
        showMap: true,
        directionsLabel: "Cómo ir",
        directionsProvider: "google",
        customDirectionsUrl: "",
      },
      key: {
        venue: "Key Club",
        address: "Costanera Norte, CABA",
        latitude: "",
        longitude: "",
        showMap: false,
        directionsLabel: "Ver ubicación",
        directionsProvider: "google",
        customDirectionsUrl: "",
      },
      qrEnabled: false,
      entranceAnimation: {
        enabled: true,
        type: "clam",
        frequency: "always",
        durationMs: 3100,
        allowSkip: true,
        primaryText: "LA PERLA",
        secondaryText: "BIRTHDAY NIGHT",
        showDate: true,
      },
    },
    images: [
      {
        id: "nahuel",
        title: "Nahuel - Host",
        caption: "Festejando en la previa",
        src: "/images/nahuel.png",
        visible: true,
        aspectRatio: "portrait",
      },
      {
        id: "fernet",
        title: "Fernet Branca & Cócteles",
        caption: "Va a haber con qué brindar",
        src: "/images/fernet.png",
        visible: true,
        aspectRatio: "landscape",
      },
      {
        id: "kevin",
        title: "Kevin de Vries en vivo",
        caption: "Después seguimos por acá · Melodic Techno",
        src: "/images/kevin-de-vries.png",
        visible: true,
        aspectRatio: "landscape",
      },
    ],
    customBlocks: [
      {
        id: "e1d7a9f5-1d86-4c71-8d55-7108df80cb29",
        title: "Dress code",
        content: "Casual nocturno, negro u oscuro.",
        visible: true,
        ctaLabel: "",
        ctaUrl: "",
      },
      {
        id: "287c67a4-b675-424c-b981-6101d63ddc74",
        title: "Bebidas",
        content: "Barra de Fernet, birras y algunos tragos para brindar.",
        visible: true,
        ctaLabel: "",
        ctaUrl: "",
      },
    ],
  };
}
