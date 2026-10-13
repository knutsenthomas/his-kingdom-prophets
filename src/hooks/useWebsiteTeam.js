import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useApp } from "../contexts/AppContext";
import { TEAM_KEY, parseTeam } from "../data/websiteTeam";
export default function useWebsiteTeam() {
  const { cmsContent } = useApp();
  const [value, setValue] = useState(undefined);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    () =>
      onSnapshot(
        doc(db, "cms_configs", "default"),
        (snap) => {
          setValue(snap.data()?.[TEAM_KEY]);
          setReady(true);
          setError("");
        },
        () => {
          setError("Teamet kunne ikke hentes. Last siden på nytt.");
          setReady(true);
        },
      ),
    [],
  );
  return {
    people: parseTeam(value ?? cmsContent[TEAM_KEY], cmsContent),
    value,
    ready,
    error,
  };
}
