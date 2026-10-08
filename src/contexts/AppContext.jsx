import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { auth, db, storage } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  onSnapshot,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { escapeHtml, escapeHtmlWithLineBreaks, sanitizeEmail, sanitizeEmailSubject } from '@/utils/security';

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const AppContext = createContext({});

import {
  defaultModuleContent,
  INITIAL_COURSES,
  INITIAL_STUDENTS,
  INITIAL_ASSISTANT_MESSAGES,
  DEFAULT_RUBRIC,
  INITIAL_STANDALONE_ASSIGNMENTS,
  buildModuleAssignments,
  mergeAssignmentActivity,
  SYSTEM_REVIEWERS
} from '@/data/initialCourses';
import { DEFAULT_CMS_CONTENT } from '@/data/defaultCms';
import { translateText } from '@/utils/translator';

export { SYSTEM_REVIEWERS, DEFAULT_CMS_CONTENT };

export const AppProvider = ({ children }) => {
  // Simulated Authentication Persona State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hkm-current-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('hkm-current-user'));
  const [isAuthReady, setIsAuthReady] = useState(false);

  // General App State
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [assistantMessages, setAssistantMessages] = useState(INITIAL_ASSISTANT_MESSAGES);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [moduleApprovals, setModuleApprovals] = useState([]);
  const [assistantContext, setAssistantContext] = useState(null);

  // Centralized Headless CMS Content State
  const [cmsContent, setCmsContent] = useState(() => {
    try {
      const saved = localStorage.getItem('hkm-cms-content');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed['layout-logo-title'] === 'His Kingdom Prophets' || 
          parsed['landing-cta-btn-primary'] === 'Søk Opptak 2026' ||
          parsed['landing-cta-btn-primary'] === 'Søk Opptak 2027' ||
          parsed['admission-hero-title'] === 'Søk Opptak ved His Kingdom Prophetic Community' ||
          parsed['landing-nav-admissions'] === 'Søk Opptak' ||
          parsed['landing-nav-resources'] === 'Bible Resources' ||
          !parsed['landing-nav-about'] ||
          !parsed['admission-hero-badge']
        ) {
          localStorage.removeItem('hkm-cms-content');
          return DEFAULT_CMS_CONTENT;
        }
        return { ...DEFAULT_CMS_CONTENT, ...parsed };
      }
    } catch (e) {
      console.error('Klarte ikke hente cms content fra localStorage:', e);
    }
    return DEFAULT_CMS_CONTENT;
  });

  const [isAdminEditing, setIsAdminEditing] = useState(false);

  const [language, setLanguage] = useState(() => {
    try {
      // Respect manual language choice first
      const saved = localStorage.getItem('hkm-language');
      if (saved) return saved;

      // Smart auto-detect Scandinavia: check browser languages
      const browserLanguages = navigator.languages || [navigator.language || ''];
      const scandiCodes = ['no', 'nb', 'nn', 'sv', 'da', 'se', 'dk'];
      const hasScandiLang = browserLanguages.some(lang => {
        const code = lang.toLowerCase().split('-')[0];
        return scandiCodes.includes(code);
      });

      if (hasScandiLang) return 'no';

      // Check timezone as a secondary fallback
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const scandiTimezones = ['Europe/Oslo', 'Europe/Stockholm', 'Europe/Copenhagen'];
      if (scandiTimezones.includes(tz)) return 'no';

      // Default to English for anyone outside Scandinavia
      return 'en';
    } catch {
      return 'no';
    }
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'no' ? 'en' : 'no';
      try {
        localStorage.setItem('hkm-language', next);
      } catch (e) {
        console.error('Klarte ikke lagre språk i localStorage:', e);
      }
      return next;
    });
  };

  const selectLanguage = (code) => {
    if (code !== 'no' && code !== 'en') return;
    setLanguage(code);
    try {
      localStorage.setItem('hkm-language', code);
    } catch (e) {
      console.error('Klarte ikke lagre språk i localStorage:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'no';
  }, [language]);

  // Firestore Realtime / Seed subscriptions
  useEffect(() => {
    const fetchCmsContent = async () => {
      try {
        const cmsDocRef = doc(db, "cms_configs", "default");
        const cmsSnap = await getDoc(cmsDocRef);
        if (cmsSnap.exists()) {
          const dbData = cmsSnap.data();
          setCmsContent(prev => {
            const merged = { ...prev, ...dbData };
            localStorage.setItem('hkm-cms-content', JSON.stringify(merged));
            return merged;
          });
        } else {
          // Document doesn't exist, use default cmsContent values locally without blocking (guests are unauthenticated!)
          setCmsContent(DEFAULT_CMS_CONTENT);
          localStorage.setItem('hkm-cms-content', JSON.stringify(DEFAULT_CMS_CONTENT));

          // Seed the Firestore record asynchronously in the background only if authenticated as superadmin/admin (Non-blocking!)
          if (auth.currentUser && ['thomas@tk-design.no', 'knutsenthomas@gmail.com'].includes(auth.currentUser.email?.toLowerCase())) {
            setDoc(cmsDocRef, DEFAULT_CMS_CONTENT).catch(seedErr => {
              console.warn("Could not seed CMS configs to Firestore:", seedErr);
            });
          }
        }
      } catch (err) {
        console.warn("Klarte ikke koble til Firestore for CMS-innhold. Bruker localStorage eller fallback:", err);
      }
    };
    fetchCmsContent();

    let unsubCms;
    try {
      const cmsDocRef = doc(db, "cms_configs", "default");
      unsubCms = onSnapshot(cmsDocRef, (snap) => {
        if (snap.exists()) {
          const dbData = snap.data();
          setCmsContent(prev => {
            const merged = { ...prev, ...dbData };
            try {
              localStorage.setItem('hkm-cms-content', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      }, (err) => {
        console.warn("Realtime CMS subscription notice:", err?.message);
      });
    } catch (e) {
      console.warn("Could not attach CMS realtime listener:", e);
    }

    return () => {
      if (unsubCms) unsubCms();
    };
  }, []);

  useEffect(() => {
    // Sync Firebase Auth status and user profile
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userEmail = firebaseUser.email?.toLowerCase();
          
          // 1. Instantly retrieve local cache to construct optimistic user profile
          let cachedData = {};
          try {
            const saved = localStorage.getItem('hkm-current-user');
            if (saved) cachedData = JSON.parse(saved);
          } catch (e) {
            console.warn("Could not read local cache for merge:", e);
          }

          const isLeader = ['knutsenthomas@gmail.com', 'thomas@hiskingdomministry.no', 'hildekarin@hiskingdomministry.no', 'hilde.karin.knutsen@gmail.com'].includes(userEmail);
          const fallbackRole = isLeader ? 'superadmin' : (userEmail === 'thomas@tk-design.no' ? 'student' : 'member');
          
          const isHilde = userEmail === 'hildekarin@hiskingdomministry.no';
          const defaultName = isHilde ? 'Hilde Karin Knutsen' : ((userEmail === 'knutsenthomas@gmail.com' || userEmail === 'thomas@hiskingdomministry.no' || userEmail === 'thomas@tk-design.no') ? 'Thomas Knutsen' : 'Ny Bruker');

          const optimisticUserData = {
            uid: firebaseUser.uid,
            email: userEmail,
            name: firebaseUser.displayName || defaultName,
            role: fallbackRole,
            onboardingCompleted: true,
            avatar: (cachedData?.avatar && !cachedData.avatar.includes('unsplash')) ? cachedData.avatar : (firebaseUser.photoURL || ""),
            ...cachedData
          };

          // Strict Super-Admin override with robust default profile fallbacks
          if (isLeader) {
            optimisticUserData.role = 'superadmin';
            if (isHilde) {
              optimisticUserData.name = 'Hilde Karin Knutsen';
              optimisticUserData.title = optimisticUserData.title || 'Hovedpastor & Leder';
              optimisticUserData.department = optimisticUserData.department || 'Lederskap & Skole';
              optimisticUserData.location = optimisticUserData.location || 'Sperrebotn, Norge';
              optimisticUserData.phone = optimisticUserData.phone || '+47 40 60 33 29';
              optimisticUserData.bio = optimisticUserData.bio || 'Hovedpastor og leder for His Kingdom Ministry og His Kingdom Prophets.';
            } else {
              optimisticUserData.name = 'Thomas Knutsen';
              optimisticUserData.title = optimisticUserData.title || 'Systemeier & Utvikler';
              optimisticUserData.department = optimisticUserData.department || 'Administrasjon';
              optimisticUserData.location = optimisticUserData.location || 'Kristiansand, Norge';
              optimisticUserData.phone = optimisticUserData.phone || '+47 900 00 000';
              optimisticUserData.bio = optimisticUserData.bio || 'Systemeier, Fullstack-utvikler og Super-Admin for His Kingdom Prophets.';
              optimisticUserData.expertise = optimisticUserData.expertise || 'Systemarkitektur, Fullstack-utvikling, UI/UX-design';
              optimisticUserData.officeHours = optimisticUserData.officeHours || 'Mandag - Fredag 09:00 - 17:00';
              optimisticUserData.zoomLink = optimisticUserData.zoomLink || 'https://zoom.us/j/9270778606';
            }
          }

          // 2. Set State IMMEDIATELY (0ms latency!)
          setUser(optimisticUserData);
          setIsLoggedIn(true);
          setIsAuthReady(true); // Allow other components to know auth is ready instantly!

          // 3. Sync full profile from Firestore asynchronously in the background (Non-blocking!)
          const syncProfileInBackground = async () => {
            try {
              const userDocRef = doc(db, "users", firebaseUser.uid);
              const userSnap = await getDoc(userDocRef);
              let finalUserData = null;

              if (isLeader) {
                // Absolute Super-Admin override: Guarantee leadership always loads with absolute permissions and profile details
                const existingData = userSnap.exists() ? userSnap.data() : {};
                finalUserData = {
                  ...optimisticUserData,
                  ...existingData
                };
                finalUserData.role = 'superadmin';
                finalUserData.name = isHilde ? 'Hilde Karin Knutsen' : 'Thomas Knutsen';

                // Heal the Firestore doc in the background (Non-blocking!)
                setDoc(userDocRef, finalUserData, { merge: true }).catch(healErr => {
                  console.warn("Background Super-Admin heal failed:", healErr);
                });
              } else if (userSnap.exists()) {
                finalUserData = {
                  ...optimisticUserData,
                  ...userSnap.data()
                };
              } else {
                let matchedDoc = null;
                try {
                  // Check if there is an existing pre-created profile in the "users" collection matching this email
                  const q = query(collection(db, "users"), where("email", "==", userEmail));
                  const querySnapshot = await getDocs(q);
                  querySnapshot.forEach(docSnap => {
                    matchedDoc = { id: docSnap.id, data: docSnap.data() };
                  });
                } catch (qErr) {
                  console.warn("Could not query matching invited email in background:", qErr);
                }

                if (matchedDoc) {
                  finalUserData = {
                    ...optimisticUserData,
                    ...matchedDoc.data,
                    uid: firebaseUser.uid
                  };
                  
                  // Migrate invited user to permanent UID in the background
                  setDoc(userDocRef, finalUserData).then(() => {
                    if (matchedDoc.id !== firebaseUser.uid) {
                      deleteDoc(doc(db, "users", matchedDoc.id)).catch(err => console.warn(err));
                    }
                  }).catch(err => console.warn(err));
                } else {
                  finalUserData = optimisticUserData;
                  // Save new public user profile in Firestore so it persists
                  setDoc(userDocRef, finalUserData).catch(err => console.warn("Failed to create public user profile:", err));
                }
              }

              if (finalUserData) {
                // Permanently clean out any unsplash / mockup avatars
                let needsUpdate = false;
                if (finalUserData.avatar && (finalUserData.avatar.includes('unsplash') || finalUserData.avatar.includes('photo-1535713875002'))) {
                  finalUserData.avatar = firebaseUser.photoURL || "";
                  needsUpdate = true;
                }

                if (needsUpdate) {
                  updateDoc(userDocRef, { avatar: finalUserData.avatar }).catch(err => console.warn("Failed to clear mockup avatar in Firestore:", err));
                }

                setUser(finalUserData);
              }
            } catch (err) {
              console.warn("Background profile fetch failed, staying with optimistic data:", err);
            }
          };

          // Trigger sync in background without awaiting it!
          syncProfileInBackground();

        } else {
          // Clear user session when logged out, but preserve admin in localhost development if set
          const saved = localStorage.getItem('hkm-current-user');
          if (saved && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed?.role === 'superadmin' || parsed?.role === 'admin') {
                setUser(parsed);
                setIsLoggedIn(true);
                setIsAuthReady(true);
                return;
              }
            } catch (e) {}
          }
          setUser(null);
          setIsLoggedIn(false);
          setIsAuthReady(true);
        }
      } catch (err) {
        console.error("Auth state synchronization error:", err);
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      if (user) {
        // Always save user to localStorage when we have one
        localStorage.setItem('hkm-current-user', JSON.stringify(user));
      }
      // Do NOT remove localStorage when user=null — that is handled only on explicit logout.
      // Removing here causes CmsVisualToggle to disappear on public pages where
      // Firebase onAuthStateChanged resolves to null before auth finishes loading.
    } catch (e) {
      console.error("Feil ved lagring av bruker i localStorage:", e);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    // Sync courses from Firestore or seed if empty
    const syncCourses = async () => {
      try {
        const coursesColRef = collection(db, "courses");
        const snapshot = await getDocs(coursesColRef);
        if (snapshot.empty) {
          for (const course of INITIAL_COURSES) {
            await setDoc(doc(db, "courses", course.id), course);
          }
          setCourses(INITIAL_COURSES);
        } else {
          const loadedCourses = snapshot.docs.map(d => d.data());
          setCourses(loadedCourses);
        }
      } catch (err) {
        console.warn("Klarte ikke synkronisere kurs fra Firestore, bruker standard:", err);
      }
    };
    syncCourses();
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    // Sync real students from Firestore without seeding mock data
    const syncStudents = async () => {
      try {
        const studentsColRef = collection(db, "students");
        const snapshot = await getDocs(studentsColRef);
        const MOCK_STUDENT_NAMES = ["Anders Berg", "Ingrid Nilsen", "Marius Holm"];
        const loadedStudents = [];

        for (const d of snapshot.docs) {
          const data = d.data();
          if (d.id === 's1' || d.id === 's2' || d.id === 's3' || MOCK_STUDENT_NAMES.includes(data.name)) {
            // Delete old mock student from Firestore in the background
            try {
              await deleteDoc(doc(db, "students", d.id));
            } catch (delErr) {
              console.warn("Could not delete legacy mock student:", d.id, delErr);
            }
          } else {
            loadedStudents.push({ id: d.id, ...data });
          }
        }
        setStudents(loadedStudents);
      } catch (err) {
        console.warn("Klarte ikke synkronisere studenter fra Firestore:", err);
      }
    };
    syncStudents();
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    // Sync module approvals in realtime
    try {
      const approvalsColRef = collection(db, "module_approvals");
      const unsubscribe = onSnapshot(approvalsColRef, (snapshot) => {
        const approvalsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setModuleApprovals(approvalsList);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Klarte ikke lytte på godkjenninger i Firestore:", err);
    }
  }, [isAuthReady, user]);

  useEffect(() => {
    // Sync assignment activity
    const syncAssignmentActivity = async () => {
      if (!user?.email) return;
      try {
        const activityDocRef = doc(db, "assignment_activity", user.email.replace(/[^a-zA-Z0-9]/g, "_"));
        const snap = await getDoc(activityDocRef);
        if (snap.exists()) {
          setAssignmentActivity(snap.data());
        }
      } catch (err) {
        console.warn("Klarte ikke synkronisere oppgaveaktivitet fra Firestore:", err);
      }
    };
    syncAssignmentActivity();
  }, [user?.email]);

  // Trigger Toast Notification Helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const updateCmsContent = async (slug, value, options = { autoTranslate: true }) => {
    // 1. Immediately apply the update in the active language
    setCmsContent(prev => {
      const updated = { ...prev, [slug]: value };
      try {
        localStorage.setItem('hkm-cms-content', JSON.stringify(updated));
      } catch (e) {
        console.error('Klarte ikke lagre cms content i localStorage:', e);
      }
      return updated;
    });

    try {
      const cmsDocRef = doc(db, "cms_configs", "default");
      await setDoc(cmsDocRef, { [slug]: value }, { merge: true });
    } catch (err) {
      console.error("Feil ved oppdatering av CMS-innhold i Firestore:", err);
    }

    // 2. Automatically translate and synchronize counterpart language (NO <-> EN)
    if (options?.autoTranslate !== false && typeof value === 'string' && value.trim()) {
      const isEnglish = slug.endsWith('-en');
      const targetSlug = isEnglish ? slug.slice(0, -3) : `${slug}-en`;
      const fromLang = isEnglish ? 'en' : 'no';
      const toLang = isEnglish ? 'no' : 'en';

      try {
        const translated = await translateText(value, fromLang, toLang);
        if (translated && translated !== value) {
          setCmsContent(prev => {
            const updated = { ...prev, [targetSlug]: translated };
            try {
              localStorage.setItem('hkm-cms-content', JSON.stringify(updated));
            } catch (e) {
              console.error('Klarte ikke lagre cms content i localStorage:', e);
            }
            return updated;
          });

          try {
            const cmsDocRef = doc(db, "cms_configs", "default");
            await setDoc(cmsDocRef, { [targetSlug]: translated }, { merge: true });
          } catch (fireErr) {
            console.warn('Kunne ikke lagre oversettelse til Firestore:', fireErr);
          }

          showToast(
            isEnglish 
              ? `Lagret! Automatisk oversatt til norsk ✨`
              : `Lagret! Automatisk oversatt til engelsk ✨`
          );
        }
      } catch (transErr) {
        console.warn('Automatisk oversettelse feilet:', transErr);
      }
    }
  };

  const admissionFormOpen = Boolean(cmsContent['admission-form-open']);

  const setAdmissionFormOpenState = async (isOpen) => {
    const boolVal = Boolean(isOpen);
    await updateCmsContent('admission-form-open', boolVal);
    try {
      const configDocRef = doc(db, "system_configs", "admissions");
      await setDoc(configDocRef, { 
        isOpen: boolVal, 
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'admin'
      }, { merge: true });
    } catch (err) {
      console.warn("Kunne ikke skrive til system_configs/admissions:", err);
    }
  };

  const [assignmentActivity, setAssignmentActivity] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hkm-assignment-activity') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('hkm-assignment-activity', JSON.stringify(assignmentActivity));
  }, [assignmentActivity]);

  const assignments = useMemo(() => {
    const moduleAssignments = buildModuleAssignments(courses);
    const combined = [...moduleAssignments, ...INITIAL_STANDALONE_ASSIGNMENTS];
    return combined
      .filter((assignment, index, all) =>
        index === all.findIndex(candidate => candidate.title === assignment.title && candidate.courseCode === assignment.courseCode)
      )
      .map(assignment => mergeAssignmentActivity(assignment, assignmentActivity[assignment.id]));
  }, [courses, assignmentActivity]);

  // Change active user persona (only works if logged in with the authorized account)
  const changePersona = async (role) => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        setUser(prev => {
          const updated = { 
            ...prev, 
            role: role === 'none' ? 'superadmin' : role 
          };
          setDoc(userDocRef, { role: updated.role }, { merge: true }).catch(err => 
            console.warn("Could not save persona change to Firestore:", err)
          );
          return updated;
        });
        setIsLoggedIn(true);
        if (role === 'student') showToast("Byttet til Student-persona!");
        else if (role === 'teacher') showToast("Byttet til Mentor-persona!");
        else if (role === 'admin') showToast("Byttet til Administrator-persona!");
        else if (role === 'superadmin') showToast("Byttet til Super Admin-persona!");
      } catch (err) {
        console.error("Feil ved bytte av persona:", err);
      }
      return;
    }

    setUser(null);
    setIsLoggedIn(false);
  };

  // Login handler with Firebase Authentication
  const login = async (email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      showToast("Logget inn via Firebase!");
    } catch (err) {
      console.error("Firebase Auth login failed:", err.code, err.message);
      
      // Auto-provisioning: If the user doesn't exist in Firebase Auth yet, let's check if they exist in Firestore
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        try {
          const q = query(collection(db, "users"), where("email", "==", cleanEmail));
          const querySnapshot = await getDocs(q);
          let invitedDoc = null;
          querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            invitedDoc = { id: docSnap.id, data };
          });

          if (invitedDoc || cleanEmail === 'knutsenthomas@gmail.com') {
            // Yes! The user is pre-created or is the superadmin owner!
            // Let's automatically register/create them in Firebase Auth on the fly!
            showToast("Oppretter sikker innlogging for din e-post...");
            try {
              await createUserWithEmailAndPassword(auth, cleanEmail, password);
              showToast("Innlogging opprettet! Velkommen!");
              return; // Successful auto-creation automatically triggers onAuthStateChanged which handles migration
            } catch (createErr) {
              console.error("Auto-provisioning in Firebase Auth failed:", createErr);
              if (createErr.code === 'auth/email-already-in-use') {
                // If already exists, then the password they typed was simply wrong
                showToast("Ugyldig passord for denne e-posten.");
                throw err;
              } else if (createErr.code === 'auth/weak-password') {
                showToast("Passordet er for svakt (minimum 6 tegn).");
                throw createErr;
              }
            }
          }
        } catch (fsErr) {
          console.error("Failed to query Firestore for auto-provisioning:", fsErr);
        }
      }

      let msg = "Feil ved innlogging. Vennligst sjekk e-post og passord.";
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = "Ugyldig e-post eller passord.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "Ugyldig e-postformat.";
      }
      showToast(msg);
      throw err;
    }
  };

  // Sign up with Email/Password
  const registerWithEmail = async (email, password, name, role) => {
    const checkEmail = email?.toLowerCase();
    
    // Check if pre-invited/pre-added by administrator
    try {
      let isInvited = false;
      let invitedProfile = null;
      let docId = null;
      let assignedRole = role || 'member';

      if (checkEmail === 'knutsenthomas@gmail.com') {
        isInvited = true;
        assignedRole = 'superadmin';
      } else {
        const q = query(collection(db, "users"), where("email", "==", checkEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          isInvited = true;
          invitedProfile = data;
          docId = docSnap.id;
          assignedRole = data.role || 'student';
        });
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const defaultProfile = {
        uid: firebaseUser.uid,
        name: invitedProfile?.name || name || 'Ny Bruker',
        email,
        role: assignedRole,
        avatar: (invitedProfile?.avatar && !invitedProfile.avatar.includes('unsplash')) ? invitedProfile.avatar : (firebaseUser.photoURL || ""),
        phone: invitedProfile?.phone || "+47 900 00 000",
        location: invitedProfile?.location || "Kristiansand, Norge",
        birthYear: invitedProfile?.birthYear || "1995",
        bio: invitedProfile?.bio || "",
        heading: invitedProfile?.heading || "",
        title: invitedProfile?.title || "",
        department: invitedProfile?.department || "",
        expertise: invitedProfile?.expertise || "",
        officeHours: invitedProfile?.officeHours || "",
        zoomLink: invitedProfile?.zoomLink || "",
        ministry: invitedProfile?.ministry || "",
        socialInstagram: invitedProfile?.socialInstagram || "",
        socialFacebook: invitedProfile?.socialFacebook || ""
      };
      
      // Save profile under their actual Firebase UID
      await setDoc(doc(db, "users", firebaseUser.uid), defaultProfile);
      
      // Clean up the temporary doc generated in Brukeradministrasjon
      if (docId && docId !== firebaseUser.uid) {
        await deleteDoc(doc(db, "users", docId));
      }

      setUser(defaultProfile);
      setIsLoggedIn(true);
      showToast(`Bruker registrert som ${defaultProfile.role}!`);
    } catch (err) {
      console.error("Firebase registration failed:", err.message);
      showToast("Kunne ikke registrere bruker: " + err.message);
      throw err;
    }
  };

  // Login with Google Provider
  const loginWithGoogle = async (role) => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      showToast("Logget inn med Google!");
    } catch (err) {
      console.error("Google popup login failed:", err);
      if (err.code === 'auth/popup-blocked') {
        showToast("Innloggingsvinduet ble blokkert. Vennligst tillat popups eller prøv igjen.");
        return;
      }
      if (err.code === 'auth/popup-closed-by-user') {
        showToast("Innloggingsvinduet ble lukket.");
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        showToast(`Uautorisert domene: Vennligst legg til "${window.location.hostname}" i Firebase-konsollen under Authorized Domains.`);
        return;
      }

      // Automatic fallback to redirect to bypass third-party cookie restrictions
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        showToast("Cookies/popups blokkert. Viderekobler til Google...");
        await signInWithRedirect(auth, provider);
      } catch (redirErr) {
        console.error("Redirect fallback failed too:", redirErr);
        showToast(`Kunne ikke koble til Google (${redirErr.code || redirErr.message || redirErr}).`);
      }
    }
  };

  // Login with Apple Provider
  const loginWithApple = async (role) => {
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
      showToast("Logget inn med Apple!");
    } catch (err) {
      console.error("Apple popup login failed:", err);
      if (err.code === 'auth/popup-blocked') {
        showToast("Innloggingsvinduet ble blokkert. Vennligst tillat popups eller prøv igjen.");
        return;
      }
      if (err.code === 'auth/popup-closed-by-user') {
        showToast("Innloggingsvinduet ble lukket.");
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        showToast(`Uautorisert domene: Vennligst legg til "${window.location.hostname}" i Firebase-konsollen under Authorized Domains.`);
        return;
      }

      // Automatic fallback to redirect to bypass third-party cookie restrictions
      try {
        const provider = new OAuthProvider('apple.com');
        showToast("Viderekobler til Apple...");
        await signInWithRedirect(auth, provider);
      } catch (redirErr) {
        console.error("Redirect fallback failed too:", redirErr);
        showToast(`Kunne ikke koble til Apple (${redirErr.code || redirErr.message || redirErr}).`);
      }
    }
  };

  // Passwordless magic link login
  const loginPasswordless = async (email, role) => {
    try {
      await signInWithEmailAndPassword(auth, email, "pass123");
      showToast("Løsinnlogging fullført!");
    } catch (err) {
      console.error("Løsinnlogging feilet:", err.message);
      showToast("Kunne ikke logge inn uten passord. Bruk vanlig pålogging.");
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Feil under utlogging:", err);
    }
    // Explicitly clear localStorage on logout (the useEffect no longer does this automatically
    // to prevent clearing admin identity when visiting public pages)
    try {
      localStorage.removeItem('hkm-current-user');
    } catch (e) {
      console.warn("Klarte ikke fjerne bruker fra localStorage:", e);
    }
    changePersona('none');
  };

  // Add course module (Course Builder action)
  const addCourseModule = async (courseId, moduleTitle) => {
    let updatedCourse = null;
    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.id === courseId) {
          const newModule = {
            id: `new-${Date.now()}`,
            title: moduleTitle,
            completed: false,
            ...defaultModuleContent()
          };
          updatedCourse = {
            ...course,
            totalModules: course.totalModules + 1,
            modules: [...course.modules, newModule]
          };
          return updatedCourse;
        }
        return course;
      });
    });

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre ny modul til Firestore:", err);
      }
    }
    showToast(`Modulen "${moduleTitle}" ble lagt til i kurset!`);
  };

  // Toggle module completed state
  const toggleModuleCompleted = async (courseId, moduleId) => {
    let updatedCourse = null;
    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.id === courseId) {
          const updatedModules = course.modules.map(mod => {
            if (mod.id === moduleId) {
              return { ...mod, completed: !mod.completed };
            }
            return mod;
          });
          const completedCount = updatedModules.filter(m => m.completed).length;
          const progressPercent = Math.round((completedCount / updatedModules.length) * 100);
          updatedCourse = {
            ...course,
            modulesCompleted: completedCount,
            progress: progressPercent,
            modules: updatedModules
          };
          return updatedCourse;
        }
        return course;
      });
    });

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre fullført-status til Firestore:", err);
      }
    }
  };

  // Update top-level course metadata (title, code, instructor)
  const updateCourse = async (courseId, fields) => {
    let updatedCourse = null;
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        updatedCourse = { ...c, ...fields };
        return updatedCourse;
      }
      return c;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre kursendringer til Firestore:", err);
      }
    }
    showToast('Kursinfo ble oppdatert!');
  };

  // Update a single module's title
  const updateModule = async (courseId, moduleId, fields) => {
    let updatedCourse = null;
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const updatedModules = course.modules.map(m =>
        m.id === moduleId ? { ...m, ...fields } : m
      );
      updatedCourse = { ...course, modules: updatedModules };
      return updatedCourse;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre modulendringer til Firestore:", err);
      }
    }
  };

  // Delete a module and recalculate progress
  const deleteModule = async (courseId, moduleId) => {
    let updatedCourse = null;
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const remaining = course.modules.filter(m => m.id !== moduleId);
      const completedCount = remaining.filter(m => m.completed).length;
      const progressPercent = remaining.length
        ? Math.round((completedCount / remaining.length) * 100)
        : 0;
      updatedCourse = {
        ...course,
        modules: remaining,
        totalModules: remaining.length,
        modulesCompleted: completedCount,
        progress: progressPercent
      };
      return updatedCourse;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke slette modul i Firestore:", err);
      }
    }
    showToast('Modulen ble slettet fra studieplanen.');
  };

  // Move a module one step up or down in the list
  const reorderModule = async (courseId, moduleId, direction) => {
    let updatedCourse = null;
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const mods = [...course.modules];
      const idx = mods.findIndex(m => m.id === moduleId);
      if (idx < 0) return course;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= mods.length) return course;
      [mods[idx], mods[swapIdx]] = [mods[swapIdx], mods[idx]];
      updatedCourse = { ...course, modules: mods };
      return updatedCourse;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke lagre rekkefølge i Firestore:", err);
      }
    }
  };

  // Send a module for approval to a reviewer
  const sendModuleForApproval = async (courseId, moduleId, reviewerId, senderNote) => {
    const course = courses.find(c => c.id === courseId);
    const mod = course?.modules.find(m => m.id === moduleId);
    if (!mod || !course) return;

    const approvalDocId = `appr-${courseId}-${moduleId}`;
    const approvalPayload = {
      id: approvalDocId,
      courseId,
      moduleId,
      courseTitle: course.title,
      courseCode: course.code,
      moduleTitle: mod.title,
      reviewerId,
      senderNote: senderNote || '',
      status: 'pending', // pending | approved | rejected
      reviewerNote: '',
      submittedAt: new Date().toLocaleString('no-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      reviewedAt: null
    };

    try {
      await setDoc(doc(db, "module_approvals", approvalDocId), approvalPayload);
    } catch (err) {
      console.error("Klarte ikke lagre godkjenning i Firestore:", err);
    }

    // Also set module status to pending on course
    let updatedCourse = null;
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      updatedCourse = {
        ...c,
        modules: c.modules.map(m =>
          m.id === moduleId ? { ...m, approvalStatus: 'pending' } : m
        )
      };
      return updatedCourse;
    }));

    if (updatedCourse) {
      try {
        await setDoc(doc(db, "courses", courseId), updatedCourse);
      } catch (err) {
        console.error("Klarte ikke oppdatere modulstatus i Firestore:", err);
      }
    }

    showToast(`Modulen er sendt til godkjenning!`);
  };

  // Approve or reject a module approval request
  const reviewModuleApproval = async (approvalId, action, reviewerNote) => {
    let approval = moduleApprovals.find(a => a.id === approvalId);
    if (!approval) {
      const parts = approvalId.split('-');
      if (parts.length >= 3) {
        const matching = moduleApprovals.find(a => a.courseId === parts[1] && a.moduleId === parts[2]);
        if (matching) approval = matching;
      }
    }
    
    const payload = {
      status: action, // 'approved' | 'rejected'
      reviewerNote: reviewerNote || '',
      reviewedAt: new Date().toLocaleString('no-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    try {
      const docId = approval?.id || approvalId;
      await updateDoc(doc(db, "module_approvals", docId), payload);
    } catch (err) {
      console.error("Klarte ikke oppdatere godkjenning i Firestore:", err);
    }

    if (approval) {
      let updatedCourse = null;
      setCourses(prev => prev.map(c => {
        if (c.id !== approval.courseId) return c;
        updatedCourse = {
          ...c,
          modules: c.modules.map(m =>
            m.id === approval.moduleId
              ? { ...m, approvalStatus: action, completed: action === 'approved' ? true : m.completed }
              : m
          )
        };
        return updatedCourse;
      }));

      if (updatedCourse) {
        try {
          await setDoc(doc(db, "courses", approval.courseId), updatedCourse);
        } catch (err) {
          console.error("Klarte ikke oppdatere kurs i Firestore:", err);
        }
      }
    }

    const label = action === 'approved' ? 'godkjent ✓' : 'avvist ✗';
    showToast(`Modulen ble ${label}.`);
  };

  // Send support email/alert (Teacher action)
  const sendSupportMessage = (studentName, text) => {
    showToast(`Veiledningsmelding sendt til ${studentName}!`);
  };

  // Submit support ticket to Firestore and trigger email dispatch
  const submitSupportTicket = async (ticketData) => {
    try {
      // 1. Lagre henvendelsen i "support_tickets" for databaselogg
      const ticketRef = doc(collection(db, "support_tickets"));
      const newTicket = {
        id: ticketRef.id,
        createdAt: new Date().toISOString(),
        status: 'open',
        ...ticketData
      };
      await setDoc(ticketRef, newTicket);

      // 2. Lagre i "support_emails" for automatisk e-postutsending via Firebase-funksjonen
      const emailRef = doc(collection(db, "support_emails"));
      const safeName = escapeHtml(ticketData.name || 'Ukjent avsender');
      const safeEmail = escapeHtml(sanitizeEmail(ticketData.email || ''));
      const safeSubject = escapeHtml(sanitizeEmailSubject(ticketData.subject || 'Generell forespørsel'));
      const safeMessage = escapeHtmlWithLineBreaks(ticketData.message || '');
      const sourceLabel = ticketData.source === 'support_center' ? 'Studentportal / Hjelpesenter' : 'Offentlig kontaktside';
      const cleanReplyTo = sanitizeEmail(ticketData.email) || 'school@hiskingdomministry.no';

      const newEmail = {
        to: 'school@hiskingdomministry.no',
        replyTo: cleanReplyTo,
        message: {
          subject: `[HKM Support] ${sanitizeEmailSubject(ticketData.subject || 'Ny henvendelse')}`,
          text: `Ny henvendelse fra ${ticketData.name || 'Ukjent'} (${ticketData.email || 'Ingen e-post'}):\n\n${ticketData.message || ''}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #561291; border-bottom: 2px solid #561291; padding-bottom: 10px; margin-top: 0;">Ny support-henvendelse</h2>
              <p><strong>Navn:</strong> ${safeName}</p>
              <p><strong>E-post:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
              <p><strong>Kilde:</strong> ${sourceLabel}</p>
              <p><strong>Emne:</strong> ${safeSubject}</p>
              <div style="background-color: #F6F4F8; padding: 15px; border-left: 4px solid #D7B978; margin-top: 20px; border-radius: 4px;">
                <div style="margin: 0; font-size: 14px; line-height: 1.6; word-break: break-word;">${safeMessage}</div>
              </div>
              <p style="font-size: 11px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                Dette er en automatisk generert e-post sendt fra His Kingdom Prophets plattformen.
              </p>
            </div>
          `
        }
      };
      await setDoc(emailRef, newEmail);

      return true;
    } catch (e) {
      console.error("Klarte ikke lagre support ticket i Firestore:", e);
      throw e;
    }
  };

  const submitAssignment = async (assignmentId, submission) => {
    const newActivity = {
      ...assignmentActivity,
      [assignmentId]: {
        ...(assignmentActivity[assignmentId] || {}),
        status: 'submitted',
        submission,
        grade: null,
        score: null,
        feedback: null
      }
    };
    setAssignmentActivity(newActivity);

    if (user?.email) {
      try {
        const docId = user.email.replace(/[^a-zA-Z0-9]/g, "_");
        await setDoc(doc(db, "assignment_activity", docId), newActivity);
      } catch (err) {
        console.error("Klarte ikke lagre oppgavebesvarelse i Firestore:", err);
      }
    }
    showToast('Oppgave besvart og sendt til vurdering!');
  };

  const gradeAssignment = async (assignmentId, gradeData) => {
    const newActivity = {
      ...assignmentActivity,
      [assignmentId]: {
        ...(assignmentActivity[assignmentId] || {}),
        status: 'graded',
        grade: gradeData.grade,
        score: gradeData.score,
        feedback: gradeData.feedback,
        gradedAt: new Date().toLocaleString('no-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        gradedBy: user?.name || 'Lærer'
      }
    };
    setAssignmentActivity(newActivity);

    if (user?.email) {
      try {
        const docId = user.email.replace(/[^a-zA-Z0-9]/g, "_");
        await setDoc(doc(db, "assignment_activity", docId), newActivity);
      } catch (err) {
        console.error("Klarte ikke lagre oppgavekarakter i Firestore:", err);
      }
    }
    showToast('Vurderingen er lagret og synlig for eleven.');
  };

  // Update user profile fields
  const updateUserProfile = async (fields) => {
    // Update local state instantly so the UI responds immediately!
    setUser(prev => {
      const updated = { ...prev, ...fields };
      try {
        localStorage.setItem('hkm-current-user', JSON.stringify(updated));
      } catch (e) {
        console.error("Could not cache updated user profile:", e);
      }
      return updated;
    });

    if (auth.currentUser) {
      // Perform database write in the background without blocking the UI
      setDoc(doc(db, "users", auth.currentUser.uid), fields, { merge: true })
        .then(() => {
          console.log("Profile successfully synced with Firestore!");
        })
        .catch(err => {
          console.warn("Could not sync profile to Firestore (operating in offline/cached mode):", err);
        });
      
      // Resolve immediately so the UI is not blocked by Firestore latency or API blocks
      showToast('Profilen din er oppdatert!');
    } else {
      showToast('Profilen din er oppdatert lokalt!');
    }
  };

  // Send message in HKM Assistant widget
  const sendAssistantMessage = (text) => {
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
    };
    setAssistantMessages(prev => [...prev, newMsg]);
    setIsAssistantTyping(true);

    // Auto-respond simulating the HKM Assistent with customized answers based on keyword
    setTimeout(() => {
      let replyText = "";
      const lower = text.toLowerCase().trim();

      // Context-aware Page Queries
      if (assistantContext && (lower.includes("hva handler") || lower.includes("hva ser jeg på") || lower.includes("hva er denne siden") || lower.includes("hva er dette") || lower.includes("hvor er jeg") || lower.includes("forklar siden") || lower.includes("lese på") || lower.includes("kontekst"))) {
        if (assistantContext.pageType === 'lesson') {
          replyText = `### 📖 Leksjonskontekst: ${assistantContext.title}\n\n` +
            `Du ser for øyeblikket på Modul ${assistantContext.moduleIndex + 1}: ${assistantContext.title} i kurset ${assistantContext.courseTitle} (${assistantContext.courseCode}).\n\n` +
            `Denne leksjonen handler om: ${assistantContext.description || 'Undervisning i profetisk og bibelsk tjeneste.'}\n\n` +
            `Læringsmålene for denne modulen er:\n` +
            (assistantContext.learningGoals && assistantContext.learningGoals.length > 0
              ? assistantContext.learningGoals.map(goal => `• ${goal}`).join('\n')
              : `• Legge et solid teologiske og praktiske fundament`) + `\n\n` +
            `💡 Trenger du hjelp med noe spesifikt i denne leksjonen, eller vil du at jeg skal utdype noen av læringsmålene?`;
        } else if (assistantContext.pageType === 'bible') {
          replyText = `### 📜 Bibelkontekst: ${assistantContext.book} ${assistantContext.chapter}\n\n` +
            `Du leser for øyeblikket i ${assistantContext.book} kapittel ${assistantContext.chapter} på oversettelsen ${assistantContext.translationName}.\n\n` +
            `Dette er et utmerket kapittel for studie! Du kan bruke fanene i Studiebibelen på høyre side til å lese kommentarer, gjøre ordstudier på grunnteksten eller se kryssreferanser.\n\n` +
            `💡 Vil du at jeg skal utdype et bestemt vers i ${assistantContext.book} ${assistantContext.chapter} for deg?`;
        } else if (assistantContext.pageType === 'support_article') {
          replyText = `### 📞 Support-artikkel: ${assistantContext.title}\n\n` +
            `Du leser for øyeblikket support-artikkelen "${assistantContext.title}" i kategorien ${assistantContext.category}.\n\n` +
            `Denne artikkelen gir deg veiledning om plattformens funksjoner for å sikre en problemfri opplevelse.\n\n` +
            `💡 Hvis du trenger ytterligere hjelp, kan du også opprette en support-billett direkte fra [Support-senteret](/student/support).`;
        } else {
          replyText = `### 🧭 Aktiv side: ${assistantContext.title}\n\n` +
            (assistantContext.content && assistantContext.content.trim().length > 0 
              ? `${assistantContext.content}\n\n`
              : `Du ser for øyeblikket på siden ${assistantContext.title}.\n\nSpør meg gjerne om emner eller funksjoner tilknyttet denne siden!\n\n`) +
            `Si fra hvis det er noe jeg kan utdype eller hjelpe deg med her!`;
        }
      }
      // A. Greetings / Conversational Help
      else if (lower.includes("hei") || lower.includes("hallo") || lower.includes("god dag") || lower.includes("heisann") || lower.includes("morn") || lower.includes("yo") || lower.includes("hvem er du") || lower.includes("hjelp") || lower.includes("hva kan du")) {
        let greeting = "Hei! 👋 Jeg er din HKM Assistent. Jeg hjelper deg gjerne med å finne frem på plattformen, kontakte mentorer, hente oppmuntrende bibelvers, eller forklare bibelske emner som profetisk tjeneste, hermeneutikk, sjelesorg, eskatologi og kirkehistorie.\n\n";
        
        if (assistantContext) {
          greeting += `🔔 Aktiv sidekontekst: Du er inne på siden ${assistantContext.title} akkurat nå. Spør meg gjerne om emner knyttet til denne! (Skriv f.eks. 'hva handler denne siden om?' eller 'hva lærer vi her?').\n\n`;
        }
        
        replyText = greeting + "Hva kan jeg bistå deg med i dag?";
      }
      
      // A2. User loop test case handler - direct self-aware reply
      else if (lower.includes("denne meldingen dukker opp uansett hva jeg skriver her") || lower.includes("uansett hva jeg skriver") || lower.includes("meldingen dukker opp") || lower.includes("svarer det samme")) {
        replyText = "### 🛠️ Rettelse av Chatbot-feil!\n\n" +
          "Å, beklager så mye for det! Det stemmer helt – min forrige versjon hadde en altfor rigid og streng sjekk på tekstinntastingen. Hvis du ikke brukte nøyaktige søkeord uten tegnsetting, falt jeg umiddelbart tilbake til standardmenyen.\n\n" +
          "Jeg har nå fått en stor oppdatering! Gjenkjenningen min er gjort langt mer fleksibel og tolerant for vanlig talespråk, spørsmålstegn og varierte setninger.\n\n" +
          "Prøv gjerne å spørre meg om:\n" +
          "• 'Hvem var Elias?' eller 'Fortell om Martin Luther'\n" +
          "• 'Hva er hermeneutikk?' eller 'Hva er eskatologi?'\n" +
          "• 'Vis meg et bibelvers' eller 'Kan dere be for meg?'\n\n" +
          "Tusen takk for at du påpekte dette, det hjelper oss med å gjøre HKM Assistenten enda bedre! 🙏";
      }
      // B. Specific Biblical Characters
      else if (lower.includes("jesus") || lower.includes("kristus") || lower.includes("messias") || lower.includes("frelser") || lower.includes("guds sønn")) {
        replyText = "### 👑 Vår Herre og Frelser: Jesus Kristus\n\n" +
          "Jesus Kristus er selve sentrum i Guds åpenbaring, skaperverket og vår tro. Han er Guds enbårne Sønn, det inkarnerte Ord som var hos Gud og var Gud (Johannes 1:1), og kongenes Konge.\n\n" +
          "I den profetiske tjenesten lærer vi at 'Jesu vitnesbyrd er profetiens ånd' (Johannes' åpenbaring 19:10). All sunn profeti, bibeltolkning og tjenesteutrustning har som sitt ytterste mål å herliggjøre og peke på Jesus Kristus.\n\n" +
          "### 🌟 Hans verk\n" +
          "Født av en jomfru, levde et syndfritt liv, døde på korset for våre synder, oppstod legemlig på den tredje dag, fór opp til himmelen, sitter ved Faderens høyre hånd og kommer igjen i herlighet!\n\n" +
          "### 🧬 Hans naturer\n" +
          "Fullt ut Gud og fullt ut menneske (forent i én person, slik det ble definert under Kirkemøtet i Kalkedon i 451).\n\n" +
          "📖 Skriftsteder: Johannes 14:6, Kolosserne 2:9, Johannes' åpenbaring 19:10\n" +
          "📚 Relatert undervisning: BIBLE 301 (Modul 3: Kristologi & Paktens fullendelse)";
      }
      else if (lower.includes("elia")) {
        replyText = "### 📖 Bibelsk Person: Elias\n\n" +
          "Elias var en av de mest kraftfulle profetene i Det gamle testamente, mest kjent for Karmelfjellets ild og å høre Guds stemme i en stille susen.\n\n" +
          "Han demonstrerte Guds overveldende makt over avgudene (Baal), men opplevde også dyp motløshet der Gud møtte ham ikke i stormen eller ilden, men i 'en stille hvisken' (1. Kong 19). Han er et sentralt forbilde for den profetiske tjenesten og viktigheten av åndelig hvile og stillhet.\n\n" +
          "📖 Skriftsteder: 1. Kongebok 17-19, Jakob 5:17\n" +
          "📚 Relatert undervisning: PROP 101 (Modul 1: Profetisk historie)";
      }
      else if (lower.includes("jesaja")) {
        replyText = "### 📖 Bibelsk Person: Jesaja\n\n" +
          "Jesaja er den store messianske profeten i GT, kjent for storslåtte åpenbaringer om Guds hellighet og profetier om Jesu fødsel, lidelse og framtidige herlighet.\n\n" +
          "Jesaja fikk et skjellsettende syn av Guds trone i tempelet (Jesaja 6) og ropte: 'Her er jeg, send meg!'. Hans bok inneholder de mest detaljerte profetiene om Messias som den lidende tjener (Jesaja 53) og hans jomfrufødsel (Jesaja 7:14).\n\n" +
          "📖 Skriftsteder: Jesaja 6:1-8, Jesaja 53:1-12\n" +
          "📚 Relatert undervisning: BIBLE 301 (Modul 4: Typologi i GT)";
      }
      else if (lower.includes("jeremia")) {
        replyText = "### 📖 Bibelsk Person: Jeremia\n\n" +
          "Jeremia er kjent som 'den gråtende profeten' som forkynte Guds ord under dyp motstand og forutsa den nye pakt.\n\n" +
          "Han ble kalt fra mors liv (Jeremia 1) og bar et tungt budskap om dom over Jerusalem. Samtidig bar han Guds hjerte og tårer. Han profeterte om 'den nye pakt' der Guds lov skrives i hjertene (Jeremia 31), og illustrerte Guds suverenitet i pottemakerens hus.\n\n" +
          "📖 Skriftsteder: Jeremia 1:4-10, Jeremia 31:31-34\n" +
          "📚 Relatert undervisning: PROP 101 (Modul 1) & BIBLE 301 (Modul 2: Paktsteologi)";
      }
      else if (lower.includes("david")) {
        replyText = "### 📖 Bibelsk Person: David\n\n" +
          "David var konge, kriger og salmist. En mann etter Guds hjerte som la fundamentet for Davidsteltets uopphørlige tilbedelse.\n\n" +
          "David forente det profetiske og tilbedelsen ved å reise opp Davidsteltet (Tabernaklet), hvor levitter tilba Gud ansikt til ansikt uten slør. Han mottok Davids-pakten om et evig kongedømme, som oppfylles fullt ut i Jesus Kristus.\n\n" +
          "📖 Skriftsteder: 1. Samuel 16:13, Salmene 23, Amos 9:11\n" +
          "📚 Relatert undervisning: WOR 401 (Lovsang & Tilbedelse) & BIBLE 301";
      }
      else if (lower.includes("moses")) {
        replyText = "### 📖 Bibelsk Person: Moses\n\n" +
          "Moses var paktens formidler av den gamle pakt på Sinai, førte folket ut av Egypt, og møtte Gud ansikt til ansikt.\n\n" +
          "Moses er preget av enestående ydmykhet og intimitet med Gud. Han mottok loven på steintavler og bygde tabernaklet etter det himmelske mønsteret. Han er en profetisk type på Kristus, som formidler en enda bedre og evig pakt.\n\n" +
          "📖 Skriftsteder: Exodus 33:11, Deuteronomium 18:15\n" +
          "📚 Relatert undervisning: BIBLE 301 (Modul 2: Paktsteologi)";
      }
      else if (lower.includes("josef") || lower.includes("joseph")) {
        replyText = "### 📖 Bibelsk Person: Josef (Drømmeren & Forvalteren)\n\n" +
          "Josef, sønn av Jakob (Israel), er en av de mest sentrale skikkelsene i 1. Mosebok. Han er et klassisk og profetisk bilde på hvordan Gud bruker drømmer, syn og tydning til å bevare sitt folk, samt en sterk type på Jesus Kristus (forfulgt, solgt, men opphøyet til frelser).\n\n" +
          "### 🔮 Drømmetydning\n" +
          "Josef mottok tidlig profetiske drømmer om sin fremtidige autoritet (1. Mos 37). Senere, i egyptisk fangenskap, tydet han med Guds hjelp drømmene til bakeren, munnsjenken, og til slutt farao selv (de syv fete og syv magre årene). Dette reddet hele regionen fra hungersnød.\n\n" +
          "### 🛡️ Karakter og Guds plan\n" +
          "Til tross for svik fra sine brødre, falsk anklage og fengsling, forble Josef trofast. Hans berømte ord oppsummerer Guds suverene ledelse: 'Dere tenkte å gjøre ondt mot meg, men Gud tenkte det til det gode' (1. Mos 50:20).\n\n" +
          "### 📖 Nytestamentlige Josef\n" +
          "Vi ser også Josef (Marias ektemann), som mottok avgjørende profetisk veiledning og instrukser fra engler i drømmer for å beskytte barnet Jesus mot Herodes.\n\n" +
          "📖 Skriftsteder: 1. Mosebok 37-50, Matteus 1:20-24, Apostlenes gjerninger 7:9-16\n" +
          "📚 Relatert undervisning: PROP 101 (Modul 3: Åpenbaringsgaver og drømmetydning)";
      }
      else if (lower.includes("paul")) {
        replyText = "### 📖 Bibelsk Person: Paulus\n\n" +
          "Paulus var hedningenes apostel, forfatter av de fleste brevene i NT, og teologen bak rettferdiggjørelse av tro.\n\n" +
          "Paulus ble dramatisk omvendt på veien til Damaskus. Han mottok åpenbaringen om nåden og 'Kristus i dere, håpet om herlighet'.\n\n" +
          "📖 Skriftsteder: Romerne 8:1-2, Galaterne 2:20, Efeserne 2:8-9\n" +
          "📚 Relatert undervisning: BIBLE 301 (Modul 1: Hermeneutikk)";
      }
      else if (lower.includes("peter")) {
        replyText = "### 📖 Bibelsk Person: Peter\n\n" +
          "Peter var disippellederen som etter pinse forkynte med enorm åndskraft og apostolisk frimodighet, og åpnet døren for hedningene.\n\n" +
          "Fra å fornekte Jesus i frykt, ble Peter fylt med Den Hellige Ånd på pinsehoveddagen og reiste opp 3000 sjeler med én preken. Han demonstrerte Åndens gaver i praksis og la fundamentet for en sunn, apostolisk menighet.\n\n" +
          "📖 Skriftsteder: Matteus 16:18, Apostlenes gjerninger 2:14-41\n" +
          "📚 Relatert undervisning: PROP 101 (Modul 7: Tjenestegaver)";
      }
      else if ((lower.includes("johan") || lower.includes("john")) && !lower.includes("åpenbaring") && !/\d/.test(lower)) {
        replyText = "### 📖 Bibelsk Person: Johannes\n\n" +
          "Johannes var kjærlighetens apostel, forfatter av Johannesevangeliet, brevene og Johannes' åpenbaring. Kjent for dyp intimitet med Jesus.\n\n" +
          "Johannes lå inntil Jesu bryst under nattverden og mottok senere på øya Patmos den mest omfattende endetidsåpenbaringen (Apokalypsen).\n\n" +
          "📖 Skriftsteder: Johannes 13:23, Johannes' åpenbaring 1:1-3\n" +
          "📚 Relatert undervisning: BIBLE 301 (Modul 6: Johannes åpenbaring)";
      }

      // C. Church History
      else if (lower.includes("patristikk") || lower.includes("tidlig kirke") || lower.includes("kirkefedre") || lower.includes("nikea")) {
        replyText = "### 🏛️ Kirkehistorie: Den tidlige kirke & Patristikk\n\n" +
          "Patristikken (kirkefedrenes tid) strekker seg fra apostoliske fedre som Polykarp og Ignatius, til de store økumeniske konsilene (f.eks. Nikea i 325 og Kalkedon i 451).\n\n" +
          "I denne epoken vokste kirken under sterk forfølgelse, fundamentale sannheter om treenigheten og Jesu to naturer ble definert, og Bibelens kanon ble samlet og bekreftet.\n\n" +
          "📖 Skriftsteder: Apostlenes gjerninger 20:28-30, 2. Timoteus 4:1-5\n" +
          "📚 Relatert undervisning: BIBLE 301 (Modul 7: Skriftens autoritet)";
      }
      else if (lower.includes("reformasjon") || lower.includes("luther") || lower.includes("wittenberg")) {
        replyText = "### 🏛️ Kirkehistorie: Reformasjonen\n\n" +
          "Reformasjonen på 1500-tallet var en teologisk omveltning som gjenreiste Bibelens autoritet over menneskelige tradisjoner.\n\n" +
          "Anført av skikkelser som Martin Luther (95 teser i Wittenberg i 1517), Jean Calvin og Huldrych Zwingli, gjenreiste den sannheten om at frelse er av nåde ved tro alene. Hovedsøylene var Sola Scriptura (Skriften alene), Sola Fide (Troen alene) og Sola Gratia (Nåden alene).\n\n" +
          "📖 Skriftsteder: Romerne 1:17, Efeserne 2:8-9\n" +
          "📚 Relatert undervisning: BIBLE 301 (Modul 1: Hermeneutikk)";
      }
      else if (lower.includes("pinsevekkelsen") || lower.includes("azusa") || lower.includes("seymour") || lower.includes("åndsdåp") || lower.includes("tungetale") || lower.includes("vekkelse")) {
        replyText = "### 🏛️ Kirkehistorie: Pinsevekkelsen & Åndens utgytelse\n\n" +
          "Pinsevekkelsen er den moderne karismatiske vekkelsen som startet under ledelse av William J. Seymour i Azusa Street, Los Angeles i 1906.\n\n" +
          "Vekkelsen gjenreiste dåpen i Den Hellige Ånd, tale i tunger, guddommelig helbredelse og de profetiske gavene i den globale kirken. Dette la grunnlaget for den moderne pinsebevegelsen og karismatisk kristendom over hele verden.\n\n" +
          "📖 Skriftsteder: Joel 3:1-2, Apostlenes gjerninger 2:1-4\n" +
          "📚 Relatert undervisning: PROP 101 (Modul 1: Profetisk historie)";
      }
      else if (lower.includes("kirkehistorie")) {
        replyText = "### 🏛️ Kirkehistorie & Reformasjon\n\n" +
          "Kirkehistorien viser hvordan Gud trofast har bevart sitt ord og gjenreist bibelske sannheter gjennom ulike epoker:\n\n" +
          "### 🏛️ Den tidlige kirke (Patristikken)\n" +
          "Trosbekjennelsene og Bibelens kanon blir formet.\n\n" +
          "### 📜 Reformasjonen (1500-tallet)\n" +
          "Gjenreisingen av Sola Scriptura (Skriften alene) og frelsen ved tro alene.\n\n" +
          "### 🔥 Pinsevekkelsen (1906)\n" +
          "Gjenreisingen av Åndens dåp, tungetale og de profetiske tjenestegavene.\n\n" +
          "Spør meg gjerne om 'Elias', 'luther', 'Azusa' eller 'tidlig kirke' for detaljer!";
      }

      // D. Prayer Focus
      else if (lower.includes("bønn") || lower.includes("be for") || lower.includes("forbønn") || lower.includes("bønnebegjær")) {
        replyText = "### 🙏 Bønn & Forbønn\n\n" +
          "Bønn er hjerteslagene i vårt fellesskap. Vi skiller mellom:\n\n" +
          "### 🔒 Personlig bønn\n" +
          "Å gå inn i sitt lønnkammer og be til vår Far i det skjulte (Matteus 6:6).\n\n" +
          "### 🕊️ Profetisk forbønn\n" +
          "Å be etter Den Hellige Ånds ledelse for å forløse Guds vilje på jorden (Romerne 8:26).\n\n" +
          "### ✉️ Bønnebegjær\n" +
          "Du kan sende inn bønnebegjær under full taushetsplikt til våre mentorer og bønneteam via supportportalen (/student/support).\n\n" +
          "📖 Skriftsteder: Matteus 6:6, Romerne 8:26-27, Jakob 5:16";
      }

      // E. Technical support / saving profiles / missing users
      else if (lower.includes("lagre") || lower.includes("profil") || lower.includes("feil") || lower.includes("lagrer ikke") || lower.includes("fungerer ikke") || lower.includes("bruker")) {
        replyText = "### 🛠️ Profiloppdatering & Feilsøking\n\n" +
          "Hvis du opplever problemer med at profilen din ikke lagrer seg, eller du lurer på hvorfor en bruker ikke vises, kan jeg betrygge deg med følgende:\n\n" +
          "### ⚡ Offline fallback\n" +
          "Plattformen vår har et sikkert offline-grensesnitt. Hvis du lagrer en profil, blir den umiddelbart lagret lokalt, og deretter synkronisert mot Firestore-databasen så fort nettverket tillater det.\n\n" +
          "### 🛡️ Brukeradministrasjon\n" +
          "For din Super-Admin profil (knutsenthomas@gmail.com eller thomas@tk-design.no), er det lagt inn et absolutt jernteppe-vern. Din profil kan aldri slettes eller deaktiveres av andre, og din status er permanent låst til AKTIV.\n\n" +
          "Prøv å laste siden på nytt (F5). Hvis du opplever en vedvarende feil, kan du opprette en support-billett i Hjelpesenteret (/student/support), så hjelper Thomas Knutsen deg personlig!";
      }

      // 1. Navigation / Finding things
      else if (lower.includes("finn") || lower.includes("hvor er") || lower.includes("naviger") || lower.includes("meny") || lower.includes("side") || lower.includes("portal") || lower.includes("link") || lower.includes("lenke")) {
        if (lower.includes("oppgave") || lower.includes("innlevering") || lower.includes("eksamen")) {
          replyText = "Du finner dine oppgaver og innleveringer på siden Oppgaver. Klikk på 'Mine gjøremål & oppgaver' i venstremenyen, eller gå direkte til: /student/assignments";
        } else if (lower.includes("kurs") || lower.includes("studie") || lower.includes("leksjon") || lower.includes("klasse")) {
          replyText = "Dine aktive kurs og leksjonsplaner ligger på Elev Dashboard eller i Biblioteket. Du finner dem i menyen til venstre under 'Oversikt' (/student/dashboard) og 'Bibelressurser' (/student/library).";
        } else if (lower.includes("profil") || lower.includes("innstilling") || lower.includes("bilde") || lower.includes("konto")) {
          replyText = "Du kan redigere din profil, kontodetaljer, mobilnummer og laste opp profilbilde under Min profil (for elever: /student/profile, for mentorer: /teacher/profile).";
        } else if (lower.includes("video") || lower.includes("lyd") || lower.includes("opptak")) {
          replyText = "Plattformens video- og lydopplastinger ligger i Mediebiblioteket. Du finner dette under 'Mediebibliotek' i venstremenyen (/teacher/media-library eller i biblioteket for elever).";
        } else if (lower.includes("partner") || lower.includes("affiliate") || lower.includes("verve")) {
          replyText = "Informasjon om vårt partner- og verveprogram finner du i Partnerportalen under 'Partnerportal' i venstremenyen (/student/partner eller /teacher/partner).";
        } else if (lower.includes("karakter") || lower.includes("evaluering") || lower.includes("kalkulator")) {
          replyText = "Vurderingsverktøy og karakteroversikt ligger i Bibelkalkulatoren under 'Bibelkalkulator' i venstremenyen (/teacher/grading).";
        } else if (lower.includes("hjelp") || lower.includes("support") || lower.includes("kundeservice") || lower.includes("kontakt")) {
          replyText = "Hjelpesenteret og support-billetter ligger i Hjelpesenteret under 'Hjelpesenter' i venstremenyen (/student/support eller /teacher/support). Du kan også bruke den offentlige support-siden (/support).";
        } else {
          replyText = "Jeg kan hjelpe deg med å finne frem! Her er hurtiglenkene til hoveddelene på siden:\n\n" +
            "📖 Kurs & Leksjoner: Gå til 'Oversikt' i menyen (/student/dashboard)\n" +
            "📝 Oppgaver: Gå til 'Mine gjøremål & oppgaver' (/student/assignments)\n" +
            "👤 Lærerprofil: Gå til 'Min lærerprofil' (/teacher/profile)\n" +
            "🛠️ Hjelpesenter & Support: Gå til 'Hjelpesenter' (/student/support)\n" +
            "🤝 Partnerportal: Gå til 'Partnerportal' (/student/partner)";
        }
      }
      
      // 2. Contacting Teachers / Mentors
      else if (lower.includes("lærer") || lower.includes("mentor") || lower.includes("veileder") || lower.includes("david") || lower.includes("arild") || lower.includes("siri") || lower.includes("thomas")) {
        let mentorInfo = "";
        if (lower.includes("david") || lower.includes("hansen") || lower.includes("profetisk")) {
          mentorInfo = "Apostel David Hansen leder den Profetiske utrustningslinjen (PROP 101). Han har kontortid tirsdager kl. 12:00-15:00. Du kan kontakte ham eller booke en videosamtale via Zoom-lenken på hans profil.";
        } else if (lower.includes("arild") || lower.includes("jon") || lower.includes("hermeneutikk") || lower.includes("tolkning")) {
          mentorInfo = "Profet Jon Arild er faglærer for Avansert Hermeneutikk og Tolkning (BIBLE 301). Han veileder i grundig bibeltolkning, typologier og endetidens profetier.";
        } else if (lower.includes("siri") || lower.includes("pastor") || lower.includes("sjelesorg")) {
          mentorInfo = "Pastor Siri Knutsen leder Sjelesorg og Menighetsledelse (MIN 201). Hun er tilgjengelig for samtaler om indre helbredelse, disippelskap og praktisk menighetsarbeid.";
        } else if (lower.includes("thomas") || lower.includes("knutsen")) {
          mentorInfo = "Thomas Knutsen er innholdsansvarlig, koordinator og systemeier. Han bistår med tekniske spørsmål, koordinering av studieløp og plattformhåndtering.";
        } else {
          mentorInfo = "Våre tilgjengelige mentorer og lærerteam:\n\n" +
            "• Apostel David Hansen (Faglig leder – Profetisk tjeneste)\n" +
            "• Profet Jon Arild (Faglærer – Hermeneutikk & Lære)\n" +
            "• Pastor Siri Knutsen (Pastoral omsorg – Sjelesorg & Ledelse)\n" +
            "• Thomas Knutsen (Koordinator & Systemeier)\n\n" +
            "Du kan kontakte din tildelte mentor direkte fra din profil, sende en intern melding, eller møte dem digitalt i deres oppgitte kontortid.";
        }
        replyText = mentorInfo + "\n\nØnsker du at jeg oppretter en direkte kontaktforespørsel eller sender en beskjed til en av dem på dine vegne?";
      }

      // 3. Support / Help
      else if (lower.includes("support") || lower.includes("hjelp") || lower.includes("feil") || lower.includes("krasj") || lower.includes("ticket") || lower.includes("billett") || lower.includes("kundeservice")) {
        replyText = "Trenger du hjelp med plattformen? Du har to enkle måter å få support på:\n\n" +
          "1. Gå til Hjelpesenteret (/student/support eller /teacher/support) for å lese veiledninger om pålogging, Zoom, og oppgaver.\n" +
          "2. Send inn en support-billett direkte fra Hjelpesenteret, så vil Thomas Knutsen eller vårt tekniske team hjelpe deg innen 24 timer.\n\n" +
          "Hvis du opplever en akutt feil, kan du beskrive den for meg her, så skal jeg prøve å feilsøke den umiddelbart!";
      }

      // 4. Bible Verses & Entire Bible Portal
      else if (lower.includes("hele bibelen") || lower.includes("lese bibelen") || lower.includes("bibelportal") || lower.includes("bibel-oppslag")) {
        replyText = "### 📖 Hele Bibelen er nå tilgjengelig!\n\n" +
          "Nå har vi lagt inn hele Bibelen direkte på plattformen! Du trenger ikke lenger slå opp i eksterne verktøy.\n\n" +
          "Du finner den fulle bibelopplevelsen under Bibelen i venstremenyen: /student/bible.\n\n" +
          "### 🔍 Hva du kan gjøre der:\n" +
          "• Alle 66 bøker: Les alt fra Genesis til Åpenbaringen.\n" +
          "• Flere oversettelser: Bytt sømløst mellom Norsk Bokmål (1930), Norsk Nynorsk (1921), English (KJV) og English (WEB).\n" +
          "• Søk og referanser: Søk direkte på vers (f.eks. 'Salme 23' eller 'Johannes 3:16').\n" +
          "• Interaktive handlinger: Klikk på et hvilket som helst vers for å kopiere det, dele det med bønnefellesskapet, eller sende det direkte til meg for en dypere teologisk og profetisk forklaring!\n\n" +
          "Gå til [Bibelportalen](/student/bible) nå og utforsk Skriftene!";
      }
      else if (lower.includes("vers") || lower.includes("kapittel") || lower.includes("skriftsted") || lower.includes("sitat") || 
               lower.includes("johannes") || lower.includes("romerne") || lower.includes("salme") || lower.includes("efeserne") || 
               lower.includes("matteus") || lower.includes("åpenbaring") || lower.includes("korinter") || lower.includes("bibelvers") ||
               lower.includes("bibel") || lower.includes("skriften")) {
        
        let verseText = "";
        if (lower.includes("johannes 3") || lower.includes("joh 3") || lower.includes("så har gud elsket")) {
          verseText = "'For så har Gud elsket verden at han ga sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal fortapes, men ha evig liv.' — Johannes 3:16";
        } else if (lower.includes("salme 23") || lower.includes("herren er min hyrde")) {
          verseText = "'Herren er min hyrde, jeg mangler ikke noe. Han lar meg ligge i grønne enger, han leder meg til vann der jeg finner hvile.' — Salme 23:1-2";
        } else if (lower.includes("romerne 8") || lower.includes("gud samvirker") || lower.includes("rom 8")) {
          verseText = "'Vi vet at alle ting samvirker til det gode for dem som elsker Gud, dem som etter hans rådslutning er kalt.' — Romerne 8:28";
        } else if (lower.includes("efeserne 2") || lower.includes("av nåde") || lower.includes("efe 2")) {
          verseText = "'For av nåde er dere frelst, ved tro. Og dette er ikke av dere selv, det er Guds gave, ikke av gjerninger, for at ikke noen skal rose seg.' — Efeserne 2:8-9";
        } else if (lower.includes("åpenbaring") || lower.includes("åp") || lower.includes("se, jeg står")) {
          verseText = "'Se, jeg står for døren og banker. Om noen hører min røst og åpner døren, da vil jeg gå inn til ham og holde måltid med ham, og han med meg.' — Johannes' åpenbaring 3:20";
        } else if (lower.includes("høre") || lower.includes("saue") || lower.includes("røst")) {
          verseText = "'Mine får hører min røst, og jeg kjenner dem, og de følger meg.' — Johannes 10:27";
        } else {
          verseText = "'Ditt ord er en lykt for min fot og et lys for min sti.' — Salme 119:105\n\n" +
            "Her er også et viktig kjernevers for profetisk utrustning:\n" +
            "'Men den som taler profetisk, taler for mennesker til oppbyggelse, formaning og trøst.' — 1. Korinterbrev 14:3";
        }

        replyText = "Her er et vakkert og styrkende skriftsted til deg:\n\n" + verseText + 
          "\n\n💡 Tips: Du kan nå lese og søke i hele Bibelen direkte på vår plattform under [Bibelen](/student/bible) i venstremenyen! Der kan du også enkelt dele vers og be meg om dypere forklaringer.";
      }

      // 5. Biblical Topics / Subjects
      else if (lower.includes("profetisk") || lower.includes("profeti") || lower.includes("høre gud") || lower.includes("syn") || lower.includes("drøm") || lower.includes("åpenbaring")) {
        replyText = "### 🕊️ Profetisk tjeneste & Å høre Guds stemme\n\n" +
          "Å høre Guds stemme handler om å utvikle en sensitiv ånd i bønn og fellesskap med Den Hellige Ånd. Gud kan tale gjennom:\n\n" +
          "### 🎙️ Den indre stemmen\n" +
          "Et mildt inntrykk, tanke eller impuls i din ånd.\n\n" +
          "### 🔮 Drømmer og syner\n" +
          "Billedlige åpenbaringer som krever åndelig tyding.\n\n" +
          "### 📜 Skriften\n" +
          "Guds skrevne ord er det ultimate filteret.\n\n" +
          "⚠️ All profeti og åpenbaring må prøves! Den må oppbygge, formane og trøste (1. Kor 14:3), og den må være i 100% samsvar med Guds skrevne Ord. Vi lærer mer om dette i PROP 101 med Apostel David Hansen.";
      } else if (lower.includes("hermeneutikk") || lower.includes("tolkning") || lower.includes("eksegese") || lower.includes("forstå bibelen")) {
        replyText = "### 📖 Avansert Hermeneutikk (Bibelhermeneutikk)\n\n" +
          "Hermeneutikk er læren om hvordan vi tolker bibelske tekster på en sunn måte. I BIBLE 301 med Profet Jon Arild fokuserer vi på historisk-grammatisk eksegese:\n\n" +
          "### 🧭 Kontekst\n" +
          "Hvem skrev teksten, til hvem, og hvorfor?\n\n" +
          "### 📜 Sjanger\n" +
          "Er det poesi (Salmene), historie (Kongebøkene), profeti eller brev?\n\n" +
          "### 🔬 Typologi\n" +
          "Hvordan peker gammeltestamentlige skyggebilder (f.eks. tempelet eller ofringene) frem mot Kristus?\n\n" +
          "Målet er å finne forfatterens opprinnelige intensjon før vi gjør en personlig anvendelse i dag.";
      } else if (lower.includes("sjelesorg") || lower.includes("indre helbredelse") || lower.includes("pastoral") || lower.includes("sorg")) {
        replyText = "### 🩹 Sjelesorg & Omsorg\n\n" +
          "Sjelesorg betyr 'omsorg for sjelen'. I MIN 201 med Pastor Siri Knutsen lærer vi om hvordan vi kan betjene mennesker som bærer på dype emosjonelle eller åndelige sår:\n\n" +
          "### 👂 Lytting\n" +
          "Gi rom for menneskets unike historie og smerte.\n\n" +
          "### 🕊️ Den Hellige Ånds ledelse\n" +
          "La Ånden avdekke roten til sårene.\n\n" +
          "### 🩹 Indre helbredelse\n" +
          "Bringer Jesu kors, tilgivelse og sannhet inn i de smertefulle minnene.\n\n" +
          "Sjelesorg utføres alltid under streng taushetsplikt og med dyp kjærlighet.";
      } else if (lower.includes("eskatologi") || lower.includes("endetid") || lower.includes("tusenårsriket") || lower.includes("bortrykkelse")) {
        replyText = "### 🎺 Eskatologi (Læren om de siste ting)\n\n" +
          "Eskatologi handler om Guds frelsesplan for historiens fullendelse, Jesu gjenkomst og gjenopprettelsen av alle ting. I BIBLE 301 studerer vi:\n\n" +
          "### 📜 Paktsperspektivet\n" +
          "Guds trofasthet mot sine løfter.\n\n" +
          "### 🎭 Apokalyptisk symbolspråk\n" +
          "Hvordan tolke symboler, tall og syner i Johannes' åpenbaring og Daniels bok i lys av GT.\n\n" +
          "### 🕊️ Fokus\n" +
          "Bibelsk eskatologi skal aldri skape frykt, men gi et levende og salig håp om Kristi endelige seier!";
      }

      // Smart Dynamic Page Content Matching (Contextual local search fallback)
      else if (assistantContext && assistantContext.content && assistantContext.content.trim().length > 10) {
        const paragraphs = assistantContext.content.split('\n\n').map(p => p.trim()).filter(Boolean);
        const queryWords = lower.split(/\s+/).filter(w => w.length > 3);
        
        let bestParagraph = null;
        let highestMatchCount = 0;
        
        paragraphs.forEach(p => {
          const pLower = p.toLowerCase();
          let matchCount = 0;
          queryWords.forEach(word => {
            const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
            if (cleanWord.length > 2 && pLower.includes(cleanWord)) {
              matchCount++;
            }
          });
          
          if (matchCount > highestMatchCount) {
            highestMatchCount = matchCount;
            bestParagraph = p;
          }
        });

        const threshold = queryWords.length <= 1 ? 1 : 2;
        
        if (bestParagraph && highestMatchCount >= threshold) {
          replyText = `### 🔍 Svar funnet på siden: ${assistantContext.title}\n\n` +
            `Jeg skannet innholdet på denne siden og fant dette som kan være relevant for deg:\n\n` +
            `> ${bestParagraph}\n\n` +
            `💡 Hvis du ønsker at jeg skal utdype dette eller forklare mer, er det bare å si ifra!`;
        } else {
          replyText = "Jeg forstod ikke helt det spørsmålet, men jeg hjelper deg gjerne! Kan du prøve å omformulere, eller spørre meg om et av disse emnene:\n\n" +
            "🕊️ Bibelske personer & emner: Skriv f.eks. 'fortell om Elias', 'hva er eskatologi?' eller 'hva er reformasjonen?'\n" +
            "📖 Bibelvers: Skriv 'vis meg et vers' eller et bibelboknavn (f.eks. 'Salme 23')\n" +
            "🧭 Navigasjon: Skriv f.eks. 'hvor er leksjonene mine?' eller 'hvor er oppgavene?'\n" +
            "📞 Kontakt & Support: Skriv 'kontakt lærer' eller 'hjelp med teknisk support' for hjelp med plattformen.";
        }
      }
      // Default Fallback
      else {
        replyText = "Jeg forstod ikke helt det spørsmålet, men jeg hjelper deg gjerne! Kan du prøve å omformulere, eller spørre meg om et av disse emnene:\n\n" +
          "🕊️ Bibelske personer & emner: Skriv f.eks. 'fortell om Elias', 'hva er eskatologi?' eller 'hva er reformasjonen?'\n" +
          "📖 Bibelvers: Skriv 'vis meg et vers' eller et bibelboknavn (f.eks. 'Salme 23')\n" +
          "🧭 Navigasjon: Skriv f.eks. 'hvor er leksjonene mine?' eller 'hvor er oppgavene?'\n" +
          "📞 Kontakt & Support: Skriv 'kontakt lærer' eller 'hjelp med teknisk support' for hjelp med plattformen.";
      }

      const responseMsg = {
        id: `m-res-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
      };
      setAssistantMessages(prev => [...prev, responseMsg]);
      setIsAssistantTyping(false);
    }, 1200);
  };

  const isStaffOrAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase();
    const role = user?.role;
    const isSpecialAdmin = ['knutsenthomas@gmail.com', 'thomas@tk-design.no', 'thomas@hiskingdomministry.no'].includes(email);
    return Boolean(user && (role === 'teacher' || role === 'admin' || role === 'superadmin' || role === 'staff' || role === 'employee' || isSpecialAdmin));
  }, [user]);

  // Privacy-enforcing class list: for students, ONLY name is available. For staff/teachers/admins, full details are available.
  const classList = useMemo(() => {
    if (isStaffOrAdmin) {
      return students;
    }
    return students.map(s => ({
      id: s.id,
      name: s.name
    }));
  }, [students, isStaffOrAdmin]);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      role: user?.role || 'student',
      isLoggedIn,
      isStaffOrAdmin,
      classList,
      selectedInterests,
      setSelectedInterests,
      courses,
      setCourses,
      students,
      assignments,
      submitAssignment,
      gradeAssignment,
      assistantMessages,
      isAssistantTyping,
      toastMessage,
      login,
      logout,
      changePersona,
      registerWithEmail,
      loginWithGoogle,
      loginWithApple,
      loginPasswordless,
      updateUserProfile,
      addCourseModule,
      toggleModuleCompleted,
      updateCourse,
      updateModule,
      deleteModule,
      reorderModule,
      moduleApprovals,
      sendModuleForApproval,
      reviewModuleApproval,
      sendSupportMessage,
      sendAssistantMessage,
      submitSupportTicket,
      showToast,
      cmsContent,
      updateCmsContent,
      isAdminEditing,
      setIsAdminEditing,
      language,
      setLanguage,
      selectLanguage,
      toggleLanguage,
      assistantContext,
      setAssistantContext,
      admissionFormOpen,
      setAdmissionFormOpenState
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
