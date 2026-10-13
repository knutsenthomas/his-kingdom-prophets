import React from "react";
import { Mail, Phone } from "lucide-react";
import { initials, safeImage } from "../data/websiteTeam";
export default function WebsiteTeamCard({ person, english = false }) {
  const role = english
    ? person.roleEn || person.roleNo
    : person.roleNo || person.roleEn;
  const bio = english
    ? person.bioEn || person.bioNo
    : person.bioNo || person.bioEn;
  return (
    <article className="about-team-card">
      {safeImage(person.image) ? (
        <img
          src={safeImage(person.image)}
          alt={person.name}
          width="400"
          height="400"
          loading="lazy"
        />
      ) : (
        <span className="about-profile-initials" aria-hidden="true">
          {initials(person.name)}
        </span>
      )}
      <div>
        <h3>{person.name}</h3>
        {role && <p className="about-team-role">{role}</p>}
        {bio && <p>{bio}</p>}
        <div className="about-person-contact">
          {person.email && (
            <a href={`mailto:${encodeURIComponent(person.email)}`}>
              <Mail size={16} />
              {person.email}
            </a>
          )}
          {person.phone && (
            <a href={`tel:${person.phone.replace(/[^+\d]/g, "")}`}>
              <Phone size={16} />
              {person.phone}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
