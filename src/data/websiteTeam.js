export const TEAM_KEY = "website-team-directory";
export const PRAYER_NAMES = [
  "Amanda Umorey",
  "Barbara H Nuckolls",
  "Caterina Wassner",
  "Darryl Nash",
  "Donald Forrest",
  "Elisabeth Hamm",
  "Erin Schuurs",
  "Estelle Hollis",
  "Hazel Shane Nercessian",
  "Jennifer Olaribigbe",
  "Juana Särg-Raani",
  "Kevin Hamm",
  "Linni Weishaar",
  "Na-Kesah Ceasar",
  "Ruben Florido",
  "Victoria Thoresen",
];
export function defaultTeam(cms = {}) {
  return [
    {
      id: "hilde",
      showHome: true,
      name: "Hilde Karin Knutsen",
      group: "staff",
      image: "/assets/hilde.jpg",
      roleNo: cms["landing-about-role-hilde"] || "Rektor og underviser",
      roleEn: cms["landing-about-role-hilde-en"] || "Principal and teacher",
      bioNo:
        cms["about-page-hilde-bio"] ||
        "Hilde Karin er rektor og underviser og leder His Kingdom Ministry sammen med Thomas. Hun har et hjerte for bønn, disippelskap og profetisk utrustning.",
      bioEn:
        cms["about-page-hilde-bio-en"] ||
        "Hilde Karin is the principal and a teacher and leads His Kingdom Ministry together with Thomas. She has a heart for prayer, discipleship and prophetic equipping.",
    },
    {
      id: "thomas",
      showHome: true,
      name: "Thomas Knutsen",
      group: "staff",
      image: "/assets/thomas.jpeg",
      roleNo: cms["landing-about-role-thomas"] || "Administrator og faglærer",
      roleEn:
        cms["landing-about-role-thomas-en"] || "Administrator and teacher",
      bioNo:
        cms["about-page-thomas-bio"] ||
        "Thomas er administrator og faglærer og leder His Kingdom Ministry sammen med Hilde Karin. Han kombinerer skolens administrative arbeid med et hjerte for bibelundervisning og disippelskap.",
      bioEn:
        cms["about-page-thomas-bio-en"] ||
        "Thomas is an administrator and teacher and leads His Kingdom Ministry together with Hilde Karin. He combines the school’s administrative work with a heart for Bible teaching and discipleship.",
    },
    {
      id: "anne",
      name: "Anne-Linn Torgersen",
      group: "staff",
      roleNo: "Medieansvarlig",
      roleEn: "Media coordinator",
      bioNo:
        cms["about-page-anne-linn-bio"] ||
        "Anne-Linn er en del av staben og har ansvaret for media. Rollen hennes knytter sammen skolens innhold og måten det formidles på, slik at flere kan bli kjent med undervisningen og fellesskapet.",
      bioEn:
        cms["about-page-anne-linn-bio-en"] ||
        "Anne-Linn is part of the staff and is responsible for media. Her role connects the school’s content with how it is shared, helping more people get to know the teaching and community.",
    },
    ...PRAYER_NAMES.map((name, i) => ({
      id: `prayer-${i}`,
      name,
      group: "prayer",
      roleNo: "Bønneteam",
      roleEn: "Prayer team",
    })),
  ].map((p) => ({
    visible: true,
    email: "",
    phone: "",
    image: "",
    bioNo: "",
    bioEn: "",
    ...p,
  }));
}
export function parseTeam(value, cms = {}) {
  if (typeof value !== "string") return defaultTeam(cms);
  try {
    const people = JSON.parse(value);
    if (
      Array.isArray(people) &&
      people.every(
        (p) => p && typeof p.id === "string" && typeof p.name === "string",
      )
    )
      return people;
  } catch {
    /* Preserve existing team if saved data is invalid. */
  }
  return defaultTeam(cms);
}
export const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
export const safeImage = (url) =>
  typeof url === "string" && (/^\/(?!\/)/.test(url) || /^https:\/\//.test(url))
    ? url
    : "";
