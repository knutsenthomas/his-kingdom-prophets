import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Users,
  Plus,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Upload,
  Save,
} from "lucide-react";
import { auth, storage } from "../firebase";
import { useApp } from "../contexts/AppContext";
import {
  signInWebsiteAdministrator,
  ensureWebsiteSession,
} from "../utils/websiteSession";
import { saveInlineContent } from "../utils/saveInlineContent";
import useWebsiteTeam from "../hooks/useWebsiteTeam";
import { TEAM_KEY, initials, safeImage } from "../data/websiteTeam";
import "../styles/hkpc-redesign.css";
import "../styles/team-admin.css";
export default function TeamAdminPage() {
  const { user } = useApp();
  useEffect(() => {
    const previous = document.title;
    document.title = "Ansatte og frivillige | HKP Community";
    return () => {
      document.title = previous;
    };
  }, []);
  const team = useWebsiteTeam();
  const [draft, setDraft] = useState([]),
    [base, setBase] = useState(),
    [selected, setSelected] = useState(""),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const admin =
    !!auth.currentUser &&
    !!user &&
    (["admin", "superadmin"].includes(user.role) ||
      [
        "knutsenthomas@gmail.com",
        "thomas@tk-design.no",
        "thomas@hiskingdomministry.no",
      ].includes(auth.currentUser.email?.toLowerCase()));
  useEffect(() => {
    if (team.ready && !dirty) {
      setDraft(team.people);
      setBase(team.value);
      setSelected((id) =>
        team.people.some((p) => p.id === id) ? id : team.people[0]?.id || "",
      );
    }
  }, [team.value, team.ready, dirty]);
  const person = draft.find((p) => p.id === selected);
  function change(key, value) {
    setDraft((d) =>
      d.map((p) => (p.id === selected ? { ...p, [key]: value } : p)),
    );
    setDirty(true);
    setNotice("");
  }
  function move(delta) {
    const i = draft.findIndex((p) => p.id === selected),
      j = i + delta;
    if (j < 0 || j >= draft.length) return;
    setDraft((d) => {
      const next = [...d];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  }
  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10_000_000
    ) {
      setError("Velg JPG, PNG eller WebP, maks 10 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await ensureWebsiteSession();
      const target = ref(storage, `cms/team/${crypto.randomUUID()}`);
      await uploadBytes(target, file, { contentType: file.type });
      change("image", await getDownloadURL(target));
      setNotice(
        "Bildet er lastet opp. Lagre og publiser for å vise det på nettsiden.",
      );
    } catch (failure) {
      setError(
        "Bildet kunne ikke lastes opp. " +
          (failure.code === "storage/unauthorized"
            ? "Kontoen mangler tilgang til bildelagringen."
            : "Prøv igjen."),
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(event) {
    event.preventDefault();
    if (draft.some((p) => !p.name.trim())) {
      setError("Alle personer må ha et navn.");
      return;
    }
    if (
      draft.some((p) => p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
    ) {
      setError("Kontroller e-postadressene.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveInlineContent(TEAM_KEY, JSON.stringify(draft), base);
      setDirty(false);
      setNotice("Teamet er lagret og publisert på Om oss.");
    } catch (failure) {
      setError(failure.message || "Endringene kunne ikke lagres.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="hkpc-landing team-admin">
      <div className="wrap">
        <Link to="/about" className="team-back">
          <ArrowLeft size={18} /> Til Om oss
        </Link>
        <header>
          <div>
            <p className="eyebrow">ADMINISTRASJON</p>
            <h1>Ansatte og frivillige</h1>
            <p>Administrer menneskene som presenteres på nettsiden.</p>
          </div>
          <Users size={36} />
        </header>
        {!admin ? (
          <section className="team-panel">
            <h2>Logg inn som administrator</h2>
            <p>
              Du trenger administratortilgang for å redigere og publisere
              teamet.
            </p>
            <button
              onClick={() =>
                signInWebsiteAdministrator().catch((e) => setError(e.message))
              }
            >
              Logg inn med Google
            </button>
          </section>
        ) : !team.ready ? (
          <p>Laster teamet …</p>
        ) : (
          <form onSubmit={save}>
            <div className="team-toolbar">
              <p>
                {draft.length} personer ·{" "}
                {dirty ? "Ulagrede endringer" : "Alt er lagret"}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const p = {
                    id: crypto.randomUUID(),
                    name: "Ny person",
                    group: "volunteer",
                    visible: false,
                    image: "",
                    roleNo: "",
                    roleEn: "",
                    bioNo: "",
                    bioEn: "",
                    email: "",
                    phone: "",
                  };
                  setDraft((d) => [...d, p]);
                  setSelected(p.id);
                  setDirty(true);
                }}
              >
                <Plus size={18} />
                Legg til person
              </button>
              <button disabled={busy || !dirty || !!team.error}>
                <Save size={18} />
                {busy ? "Arbeider …" : "Lagre og publiser"}
              </button>
            </div>
            <div className="team-admin-grid">
              <nav className="team-panel team-list" aria-label="Personer">
                {draft.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    aria-pressed={p.id === selected}
                    onClick={() => setSelected(p.id)}
                  >
                    {safeImage(p.image) ? (
                      <img src={safeImage(p.image)} alt="" />
                    ) : (
                      <span>{initials(p.name)}</span>
                    )}
                    <div>
                      <strong>{p.name}</strong>
                      <small>
                        {p.visible ? "Synlig på nettsiden" : "Skjult"} ·{" "}
                        {p.group === "staff"
                          ? "Ansatt"
                          : p.group === "prayer"
                            ? "Bønneteam"
                            : "Frivillig"}
                      </small>
                    </div>
                  </button>
                ))}
              </nav>
              {person && (
                <section className="team-panel team-editor">
                  <h2>{person.name}</h2>
                  <p>
                    Feltene nedenfor er beregnet på offentlig visning. Legg bare
                    inn kontaktinformasjon som kan publiseres.
                  </p>
                  <fieldset disabled={busy}>
                    <div className="team-photo">
                      {safeImage(person.image) ? (
                        <img src={safeImage(person.image)} alt={person.name} />
                      ) : (
                        <span>{initials(person.name)}</span>
                      )}
                      <div>
                        <label className="team-upload">
                          <Upload size={18} />
                          Last opp bilde
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={upload}
                          />
                        </label>
                        <small>
                          Velg fra bilder eller filer på enheten · maks 10 MB
                        </small>
                        <button
                          type="button"
                          className="team-secondary"
                          disabled={!person.image}
                          onClick={() => change("image", "")}
                        >
                          Fjern bildet
                        </button>
                      </div>
                    </div>
                    <label>
                      Navn *
                      <input
                        required
                        maxLength={120}
                        value={person.name}
                        onChange={(e) => change("name", e.target.value)}
                      />
                    </label>
                    <label>
                      Gruppe
                      <select
                        value={person.group}
                        onChange={(e) => change("group", e.target.value)}
                      >
                        <option value="staff">Ansatte / stab</option>
                        <option value="volunteer">Frivillige</option>
                        <option value="prayer">Bønneteam</option>
                      </select>
                    </label>
                    <div className="team-fields">
                      {[
                        ["roleNo", "Rolle på norsk"],
                        ["roleEn", "Rolle på engelsk"],
                        ["email", "Offentlig e-post"],
                        ["phone", "Offentlig telefon"],
                      ].map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            type={
                              key === "email"
                                ? "email"
                                : key === "phone"
                                  ? "tel"
                                  : "text"
                            }
                            maxLength={180}
                            value={person[key] || ""}
                            onChange={(e) => change(key, e.target.value)}
                          />
                        </label>
                      ))}
                    </div>
                    {[
                      ["bioNo", "Presentasjon på norsk"],
                      ["bioEn", "Presentasjon på engelsk"],
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <textarea
                          rows={4}
                          maxLength={3000}
                          value={person[key] || ""}
                          onChange={(e) => change(key, e.target.value)}
                        />
                      </label>
                    ))}
                    <label className="team-check">
                      <input
                        type="checkbox"
                        checked={!!person.visible}
                        onChange={(e) => change("visible", e.target.checked)}
                      />
                      Vis personen på nettsiden
                    </label>
                    <label className="team-check">
                      <input
                        type="checkbox"
                        checked={!!person.showHome}
                        onChange={(e) => change("showHome", e.target.checked)}
                      />
                      Vis også i presentasjonen på forsiden
                    </label>
                    <div className="team-order">
                      <button
                        type="button"
                        className="team-secondary"
                        disabled={draft[0]?.id === selected}
                        onClick={() => move(-1)}
                      >
                        <ArrowUp size={18} />
                        Flytt opp
                      </button>
                      <button
                        type="button"
                        className="team-secondary"
                        disabled={draft.at(-1)?.id === selected}
                        onClick={() => move(1)}
                      >
                        <ArrowDown size={18} />
                        Flytt ned
                      </button>
                    </div>
                  </fieldset>
                </section>
              )}
            </div>
          </form>
        )}
        {(error || team.error) && (
          <p role="alert" className="team-error">
            {error || team.error}
          </p>
        )}
        {notice && (
          <p role="status" className="team-notice">
            {notice}
          </p>
        )}
      </div>
    </main>
  );
}
