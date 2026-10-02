import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, ShieldAlert, Check, Search, Download, Plus, 
  Trash2, Edit3, Filter, Lock, BookOpen, Video, BarChart3, 
  Database, Save, Undo, Mail, Calendar, Info, HelpCircle, 
  AlertTriangle, Key, ChevronLeft, ChevronRight, X,
  Unlock, ToggleLeft, ToggleRight, ExternalLink, RefreshCw,
  CheckCircle2, Clock, Sparkles, GraduationCap, Eye, FileText, Phone
} from 'lucide-react';

const DEFAULT_USERS = [
  {
    uid: "seed-user-1",
    name: "Dr. Maria Berg",
    email: "maria.berg@scholastic.edu",
    role: "teacher",
    created: "05. Sep 2023",
    status: "AKTIV",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVh7_cVKbWkuK2rOM9qy0R48TzHRB1yOAUujl5tSQ2fP1TyptmN4fAUIjTCe0NsFCoKZSDFr7GPTgFmY52DS6dgXtEf6jVpS2r9TRvhEc7CT2mtIu1PnI4Da-ou3AQQAuxCiIEAHXhBrvjdRs9lmi7zZnYmXWC5ubturfesSLzH7ku2Q-_NQsAPezX4Xj8MNcl1K9LSShP1qgC7UHYO3_qnhpxieU3r3JWIyck925KUHiiCwU9fCK_lG3vEU84uWmwgEoewaWn0zw"
  },
  {
    uid: "seed-user-2",
    name: "Erik Johansen",
    email: "erik.johansen@university.no",
    role: "student",
    created: "12. Aug 2023",
    status: "AKTIV",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBRvzPRTuKq3Ib_fe3fMYp7HfeT4EikCQCkudPyTvBKl_kj8SQGtZpneq9TB8oCljhLaMskiAJKaIYGK9V_vLYunJjVJpfVJeWQ-U_FAGxzFRGrxaLN46DQJdvyIKoHVMThbGx51FEJel6HxCEBcRzSTm-amRmJ9VQLkOXMq23YAxnwmEm1e10Kho3bX32QnbwGzoHd_voj63WYPk0CaXTMFzZF5nSvX5WEUpGlIwidRdP78AypfPq1tE89kHETPg4SyOxctW4MGQ"
  },
  {
    uid: "seed-user-3",
    name: "Thomas Hansen",
    email: "t.hansen@admin.no",
    role: "admin",
    created: "22. Okt 2023",
    status: "VENTER",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8bPh_VbHs2yNF1zTycEcpN_GDyR3OMEg2xfPZ7wgE1aCzwuyCUnoZ4gDO9kzpPPM4aMQ1hiJnJJ921ugnSXPFhrBnl2STp1nUdK5ibik3-gZR4F-OagQZNApVMgqJsWdcYFg6JVLSnLwRSlhD7uBrQ6CZadaFiTn37f-JY78sKX5M4NCIywS4UHpF-n9z_s3xTNmbFCQQtvHmZS85JbLH5JM1sUrU8VbxdhJmHS3SEv4Y-kQbxxW8b9t3Gisr35xvS3WQe790Lvo"
  },
  {
    uid: "seed-user-4",
    name: "Ingrid Olsen",
    email: "ingrid.olsen@student.uio.no",
    role: "student",
    created: "15. Jan 2024",
    status: "INAKTIV",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB60YSM54GcVLs-xh6T9rSx7izdFzZGT_Lafzag7P7JhIQnAkmpzgUpHwhZdOEsxnNNdJGAWAeD1ph49TQLvMGpHyuszHgjtBTh2g5y2ZHfCLfhLRPFDjTKeT7tc7L7w08S0l8joV7xrA9zQJEMPeRZFzIWBqPY2t6ticmMXnWOkfcDq5mZ_J0PW03J6x84OVmZSmHb7h-9ir9h39HV3zdKTUNgjk8dibLa4gKIrriSNgvDi7mCOduYkBKRaA7jnSDB4Zaco7RAkAM"
  },
  {
    uid: "seed-user-5",
    name: "Anders Larsen",
    email: "anders.l@videregaende.no",
    role: "teacher",
    created: "02. Feb 2024",
    status: "AKTIV",
    avatar: ""
  },
  {
    uid: "seed-user-6",
    name: "Thomas Knutsen",
    email: "thomas@tk-design.no",
    role: "superadmin",
    created: "23. May 2026",
    status: "AKTIV",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
  }
];

const DEFAULT_PERMISSIONS = {
  student: {
    course: { create: false, publish: false, delete: false },
    user: { invite: false, changeRole: false, deactivate: false },
    media: { upload: true, editMeta: false, delete: false },
    analytics: { viewReports: false, exportFinancials: false, resetStats: false },
    security: { manageDb: false, viewLogs: false, clearCache: false }
  },
  teacher: {
    course: { create: true, publish: true, delete: false },
    user: { invite: false, changeRole: false, deactivate: false },
    media: { upload: true, editMeta: true, delete: false },
    analytics: { viewReports: true, exportFinancials: false, resetStats: false },
    security: { manageDb: false, viewLogs: false, clearCache: false }
  },
  admin: {
    course: { create: true, publish: true, delete: true },
    user: { invite: true, changeRole: true, deactivate: true },
    media: { upload: true, editMeta: true, delete: true },
    analytics: { viewReports: true, exportFinancials: true, resetStats: false },
    security: { manageDb: false, viewLogs: true, clearCache: false }
  },
  superadmin: {
    course: { create: true, publish: true, delete: true },
    user: { invite: true, changeRole: true, deactivate: true },
    media: { upload: true, editMeta: true, delete: true },
    analytics: { viewReports: true, exportFinancials: true, resetStats: true },
    security: { manageDb: true, viewLogs: true, fillCache: true }
  }
};

export default function AdminPortal() {
  const { user: currentUser, showToast, admissionFormOpen, setAdmissionFormOpenState, language } = useApp();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = new URLSearchParams(window.location.search).get('tab');
    if (tabParam === 'admissions' || tabParam === 'opptak') return 'admissions';
    if (tabParam === 'permissions') return 'permissions';
    return 'users';
  });
  
  // Guard Check
  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  // --- TAB 1: USERS STATE ---
  const [usersList, setUsersList] = useState(() => {
    try {
      const cached = localStorage.getItem('hkm-admin-portal-users');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load cached users for AdminPortal:", e);
    }
    return DEFAULT_USERS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'student' | 'teacher' | 'admin' | 'superadmin'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'AKTIV' | 'VENTER' | 'INAKTIV'
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserStatus, setNewUserStatus] = useState('AKTIV');

  // --- TAB 2: OPPTAK & SØKNADSSKJEMA STATE ---
  const [applicationsList, setApplicationsList] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);
  const [isTogglingAdmission, setIsTogglingAdmission] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [admissionsSearch, setAdmissionsSearch] = useState('');
  const [admissionsSubTab, setAdmissionsSubTab] = useState('applications'); // 'applications' | 'leads'

  // --- TAB 3: PERMISSIONS STATE ---
  const [selectedRole, setSelectedRole] = useState('admin');
  const [activePermissionGroup, setActivePermissionGroup] = useState('course'); // 'course' | 'user' | 'media' | 'analytics' | 'security'
  const [permissionsMatrix, setPermissionsMatrix] = useState(DEFAULT_PERMISSIONS);

  // Fetch admissions & leads
  const fetchAdmissionsData = async () => {
    if (!isAuthorized) return;
    setIsLoadingAdmissions(true);
    try {
      const appSnap = await getDocs(collection(db, "applications"));
      const apps = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      apps.sort((a, b) => {
        const timeA = a.submittedAt?.seconds ? a.submittedAt.seconds * 1000 : new Date(a.date || a.createdAt || 0).getTime();
        const timeB = b.submittedAt?.seconds ? b.submittedAt.seconds * 1000 : new Date(b.date || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setApplicationsList(apps);
    } catch (err) {
      console.warn("Kunne ikke hente søknader:", err);
    }

    try {
      const leadSnap = await getDocs(collection(db, "admission_leads"));
      const leads = leadSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      leads.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setLeadsList(leads);
    } catch (err) {
      console.warn("Kunne ikke hente leads:", err);
    } finally {
      setIsLoadingAdmissions(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchAdmissionsData();
    }
  }, [isAuthorized]);

  const handleToggleAdmissionForm = async () => {
    setIsTogglingAdmission(true);
    try {
      const nextState = !admissionFormOpen;
      await setAdmissionFormOpenState(nextState);
      showToast(
        nextState 
          ? "Søknadsskjemaet er nå ÅPENT for alle søkere på nettsiden!" 
          : "Søknadsskjemaet er nå LÅST for vanlige besøkende (åpner 1. jan 2027)."
      );
    } catch (err) {
      showToast("Kunne ikke oppdatere skjema-status: " + err.message, "error");
    } finally {
      setIsTogglingAdmission(false);
    }
  };

  const exportApplicationsCsv = () => {
    if (!applicationsList.length) {
      showToast("Ingen søknader å eksportere.");
      return;
    }
    const headers = ["Navn", "E-post", "Telefon", "Adresse", "Kjønn", "Sivilstatus", "Studielinje", "Betalingsplan", "Status", "Innsendt dato"];
    const rows = applicationsList.map(a => [
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.phone || '').replace(/"/g, '""')}"`,
      `"${(a.address || '').replace(/"/g, '""')}"`,
      `"${(a.gender || '').replace(/"/g, '""')}"`,
      `"${(a.maritalStatus || '').replace(/"/g, '""')}"`,
      `"${(a.program || '').replace(/"/g, '""')}"`,
      `"${(a.paymentPlan || '').replace(/"/g, '""')}"`,
      `"${(a.status || 'Mottatt').replace(/"/g, '""')}"`,
      `"${(a.submittedAt?.toDate?.() ? a.submittedAt.toDate().toLocaleDateString('no-NO') : a.date || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HKPC_Soknader_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Søknader eksportert til CSV (UTF-8 BOM).");
  };

  const exportLeadsCsv = () => {
    if (!leadsList.length) {
      showToast("Ingen registrerte på interesselisten å eksportere.");
      return;
    }
    const headers = ["Navn", "E-post", "Kilde", "Registrert dato"];
    const rows = leadsList.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.source || 'admission_portal_reminder_2027').replace(/"/g, '""')}"`,
      `"${(l.createdAt?.toDate?.() ? l.createdAt.toDate().toLocaleDateString('no-NO') : '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HKPC_Interesseliste_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Interesseliste eksportert til CSV (UTF-8 BOM).");
  };

  // Sync users database
  useEffect(() => {
    if (!isAuthorized) return;

    // Immediately inject the logged-in superadmin and ensure local state has defaults so the table is never empty/frozen!
    setUsersList(prev => {
      let list = [...prev];
      if (list.length === 0) {
        list = [...DEFAULT_USERS];
      }
      if (currentUser && !list.some(u => u.email?.toLowerCase() === currentUser.email?.toLowerCase())) {
        list.push({
          uid: currentUser.uid || 'current-admin',
          name: currentUser.name || 'Thomas Knutsen',
          email: currentUser.email,
          role: currentUser.role || 'superadmin',
          created: '23. May 2026',
          status: 'AKTIV',
          avatar: currentUser.avatar || ''
        });
      }
      localStorage.setItem('hkm-admin-portal-users', JSON.stringify(list));
      return list;
    });

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        if (querySnapshot.empty) {
          // Seed initial demo users to Firestore
          const list = [...DEFAULT_USERS];
          if (currentUser && !list.some(u => u.email?.toLowerCase() === currentUser.email?.toLowerCase())) {
            list.push({
              uid: currentUser.uid || 'current-admin',
              name: currentUser.name || 'Thomas Knutsen',
              email: currentUser.email,
              role: currentUser.role || 'superadmin',
              created: '23. May 2026',
              status: 'AKTIV',
              avatar: currentUser.avatar || ''
            });
          }
          // Set state and cache instantly so UI is never blank/frozen!
          setUsersList(list);
          localStorage.setItem('hkm-admin-portal-users', JSON.stringify(list));

          // Seed Firestore in the background without blocking the UI
          list.forEach(async (u) => {
            try {
              await setDoc(doc(db, "users", u.uid), u);
            } catch (wErr) {
              console.warn("Could not seed user in background:", u.email, wErr);
            }
          });
        } else {
          const loaded = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
          // Ensure current user is in the list
          if (currentUser && !loaded.some(u => u.email?.toLowerCase() === currentUser.email?.toLowerCase())) {
            loaded.push({
              uid: currentUser.uid || 'current-admin',
              name: currentUser.name || 'Thomas Knutsen',
              email: currentUser.email,
              role: currentUser.role || 'superadmin',
              created: '23. May 2026',
              status: 'AKTIV',
              avatar: currentUser.avatar || ''
            });
          }
          setUsersList(loaded);
          localStorage.setItem('hkm-admin-portal-users', JSON.stringify(loaded));
        }
      } catch (err) {
        console.warn("Firestore fetch failed, loading local/offline state:", err);
        const cached = localStorage.getItem('hkm-admin-portal-users');
        let list = [];
        try {
          list = cached ? JSON.parse(cached) : [];
        } catch {
          list = [];
        }
        if (!Array.isArray(list) || list.length === 0) {
          list = [...DEFAULT_USERS];
        }
        // Ensure current user is in the list
        if (currentUser && !list.some(u => u.email?.toLowerCase() === currentUser.email?.toLowerCase())) {
          list.push({
            uid: currentUser.uid || 'current-admin',
            name: currentUser.name || 'Thomas Knutsen',
            email: currentUser.email,
            role: currentUser.role || 'superadmin',
            created: '23. May 2026',
            status: 'AKTIV',
            avatar: currentUser.avatar || ''
          });
        }
        setUsersList(list);
      }
    };
    fetchUsers();
  }, [isAuthorized, currentUser]);

  // Sync permissions
  useEffect(() => {
    if (!isAuthorized) return;
    const fetchPermissions = async () => {
      try {
        const snapshot = await getDocs(collection(db, "system_configs"));
        const permDoc = snapshot.docs.find(d => d.id === 'permissions');
        if (permDoc) {
          const data = permDoc.data();
          const merged = { ...DEFAULT_PERMISSIONS };
          Object.keys(DEFAULT_PERMISSIONS).forEach(role => {
            merged[role] = {
              ...DEFAULT_PERMISSIONS[role],
              ...(data[role] || {})
            };
            Object.keys(DEFAULT_PERMISSIONS[role]).forEach(group => {
              merged[role][group] = {
                ...DEFAULT_PERMISSIONS[role][group],
                ...(data[role]?.[group] || {})
              };
            });
          });
          setPermissionsMatrix(merged);
        } else {
          await setDoc(doc(db, "system_configs", "permissions"), DEFAULT_PERMISSIONS);
          setPermissionsMatrix(DEFAULT_PERMISSIONS);
        }
      } catch (err) {
        console.warn("Could not sync permissions config, utilizing defaults:", err);
      }
    };
    fetchPermissions();
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-outline-variant/60 max-w-md w-full shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-red-50 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#561291]">Adgang Avvist</h2>
          <p className="text-sm text-[#41474d] leading-relaxed">
            Kun administratorer og super admin har tilgang til denne portalen. Vennligst logg på med en autorisert konto for å administrere systemet.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-[#561291] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow"
          >
            Til Logg Inn
          </button>
        </motion.div>
      </div>
    );
  }

  // --- ACTIONS ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    // Capture the values locally to prevent losing them on state reset
    const userName = newUserName;
    const userEmail = newUserEmail;
    const userRole = newUserRole;
    const userStatus = newUserStatus;

    // Reset input fields and close modal immediately to prevent multiple submissions
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('student');
    setNewUserStatus('AKTIV');
    setIsAddModalOpen(false);

    const newUid = "usr-" + Date.now();
    const newUser = {
      uid: newUid,
      name: userName,
      email: userEmail,
      role: userRole,
      created: new Date().toLocaleDateString('no-NO', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: userStatus,
      avatar: ""
    };

    // Update local state instantly so the user sees the list update immediately!
    setUsersList(prev => {
      const updated = [newUser, ...prev];
      localStorage.setItem('hkm-admin-portal-users', JSON.stringify(updated));
      return updated;
    });

    // Write to Firestore in the background
    try {
      await setDoc(doc(db, "users", newUid), newUser);
      showToast(`Brukeren ${userName} ble opprettet!`);
    } catch (err) {
      console.warn("Could not save new user to Firestore:", err);
      showToast("Lokal opprettelse vellykket! (Frakoblet)");
    }
  };

  const handleUpdateUserRole = async (uid, role) => {
    const targetUser = usersList.find(u => u.uid === uid);
    if (targetUser?.email?.toLowerCase() === 'knutsenthomas@gmail.com') {
      showToast("Super-Admin-rollen til Thomas Knutsen kan ikke endres!");
      return;
    }

    const updated = usersList.map(u => u.uid === uid ? { ...u, role } : u);
    setUsersList(updated);
    localStorage.setItem('hkm-admin-portal-users', JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "users", uid), { role });
      showToast("Rolle oppdatert!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserStatus = async (uid, status) => {
    const targetUser = usersList.find(u => u.uid === uid);
    if (targetUser?.email?.toLowerCase() === 'knutsenthomas@gmail.com') {
      showToast("Statusen til Thomas Knutsen kan ikke settes til inaktiv!");
      return;
    }

    const updated = usersList.map(u => u.uid === uid ? { ...u, status } : u);
    setUsersList(updated);
    localStorage.setItem('hkm-admin-portal-users', JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "users", uid), { status });
      showToast("Status oppdatert!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (uid, name) => {
    const targetUser = usersList.find(u => u.uid === uid);
    if (targetUser?.email?.toLowerCase() === 'knutsenthomas@gmail.com') {
      showToast("Super-Admin Thomas Knutsen kan ikke slettes!");
      return;
    }

    if (!window.confirm(`Er du sikker på at du vil slette ${name}?`)) return;
    const updated = usersList.filter(u => u.uid !== uid);
    setUsersList(updated);
    localStorage.setItem('hkm-admin-portal-users', JSON.stringify(updated));
    showToast(`Brukeren ${name} ble slettet.`);
  };

  const handleExportCSV = () => {
    const headers = ['Navn', 'E-post', 'Rolle', 'Opprettet', 'Status'];
    const rows = filteredUsers.map(u => [
      u.name,
      u.email,
      u.role.toUpperCase(),
      u.created,
      u.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hkm_brukerliste_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV-fil eksportert!");
  };

  const handleSavePermissions = async () => {
    try {
      await setDoc(doc(db, "system_configs", "permissions"), permissionsMatrix);
      showToast("Rettighetsmatrisen ble lagret ✓");
    } catch (err) {
      console.error(err);
      showToast("Klarte ikke lagre konfigurasjon til Firestore.");
    }
  };

  const togglePermission = (role, group, action) => {
    setPermissionsMatrix(prev => {
      const prevRole = prev?.[role] || DEFAULT_PERMISSIONS[role] || {};
      const prevGroup = prevRole?.[group] || DEFAULT_PERMISSIONS[role]?.[group] || {};
      return {
        ...prev,
        [role]: {
          ...prevRole,
          [group]: {
            ...prevGroup,
            [action]: !prevGroup[action]
          }
        }
      };
    });
  };

  // --- FILTERS & PAGINATION LOGIC ---
  const filteredUsers = (usersList || []).filter(u => {
    if (!u) return false;
    const name = u.name || '';
    const email = u.email || '';
    const uid = u.uid || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          uid.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));

  const rolePermissions = permissionsMatrix?.[selectedRole] || DEFAULT_PERMISSIONS[selectedRole] || {};
  const groupPermissions = rolePermissions?.[activePermissionGroup] || DEFAULT_PERMISSIONS[selectedRole]?.[activePermissionGroup] || {};

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 max-w-[1440px] mx-auto text-on-background">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-outline-variant/40 pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#561291] mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-sm text-on-surface-variant">
            Overordnet system- og brukerhåndtering for His Kingdom Prophets.
          </p>
        </div>
        
        {/* Tab Selection */}
        <div className="flex bg-[#eaeef2] p-1 rounded-full relative overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 sm:px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all relative z-10 whitespace-nowrap ${
              activeTab === 'users' ? 'text-[#561291] font-bold' : 'text-[#41474d] hover:text-[#171c1f]'
            }`}
          >
            Brukerhåndtering
          </button>
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-4 sm:px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all relative z-10 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'admissions' ? 'text-[#561291] font-bold' : 'text-[#41474d] hover:text-[#171c1f]'
            }`}
          >
            <span>Opptak & Skjema</span>
            <span className={`w-2 h-2 rounded-full shrink-0 ${admissionFormOpen ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 sm:px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all relative z-10 whitespace-nowrap ${
              activeTab === 'permissions' ? 'text-[#561291] font-bold' : 'text-[#41474d] hover:text-[#171c1f]'
            }`}
          >
            Rettighetsstyring
          </button>
          
          <motion.div
            className="absolute top-1 bottom-1 left-1 bg-white rounded-full shadow-sm"
            layoutId="portalTabIndicator"
            style={{ width: 'calc(33.333% - 2px)' }}
            animate={{ 
              x: activeTab === 'users' ? '0%' : activeTab === 'admissions' ? '100%' : '200%' 
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Quick KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-outline-variant/40 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Totalt antall brukere</p>
                <p className="text-3xl font-serif font-bold text-[#561291] mt-2">{(usersList || []).length}</p>
              </div>
              <div className="bg-white border border-outline-variant/40 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Studenter</p>
                <p className="text-3xl font-serif font-bold text-[#561291] mt-2">{(usersList || []).filter(u=>u?.role==='student').length}</p>
              </div>
              <div className="bg-white border border-outline-variant/40 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Mentorer / Lærere</p>
                <p className="text-3xl font-serif font-bold text-secondary mt-2">{(usersList || []).filter(u=>u?.role==='teacher').length}</p>
              </div>
              <div className="bg-white border border-outline-variant/40 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Administratorer</p>
                <p className="text-3xl font-serif font-bold text-tertiary mt-2">{(usersList || []).filter(u=>u?.role==='admin' || u?.role==='superadmin').length}</p>
              </div>
            </div>

            {/* Filters Dashboard */}
            <div className="bg-white border border-[#c1c7ce]/40 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-6">
                
                {/* Search */}
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72787e]" />
                  <input
                    type="text"
                    placeholder="Søk på navn, e-post, ID..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-[#f0f4f8] border border-[#c1c7ce]/60 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#561291] focus:outline-none transition-all"
                    style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  />
                </div>

                {/* Role Tabs inside filter */}
                <div className="space-y-1 w-full sm:w-auto">
                  <label className="block text-[10px] font-bold text-[#72787e] uppercase tracking-wider">Rolle</label>
                  <div className="flex bg-[#eaeef2] p-1 rounded-xl">
                    {['ALL', 'student', 'teacher', 'admin', 'superadmin'].map(r => (
                      <button
                        key={r}
                        onClick={() => { setRoleFilter(r); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                          roleFilter === r 
                            ? 'bg-white text-[#561291] shadow-sm' 
                            : 'text-[#41474d] hover:text-[#171c1f]'
                        }`}
                      >
                        {r === 'ALL' ? 'Alle' : r === 'teacher' ? 'Lærer' : r === 'superadmin' ? 'Super' : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-1 w-full sm:w-auto">
                  <label className="block text-[10px] font-bold text-[#72787e] uppercase tracking-wider">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-[#eaeef2] border-none rounded-xl px-4 py-2 text-xs font-semibold text-[#561291] focus:ring-2 focus:ring-[#561291] outline-none"
                  >
                    <option value="ALL">Alle statuser</option>
                    <option value="AKTIV">Aktiv</option>
                    <option value="VENTER">Venter</option>
                    <option value="INAKTIV">Inaktiv</option>
                  </select>
                </div>

              </div>

              {/* Utility Buttons */}
              <div className="flex items-center gap-3 self-end lg:self-auto">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[#c1c7ce] rounded-xl text-xs font-bold text-[#46617b] hover:bg-[#f6fafe] active:scale-[0.98] transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Eksporter CSV
                </button>
                
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#561291] hover:opacity-95 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Legg til ny bruker
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-[#c1c7ce]/40 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#eaeef2]/60 border-b border-[#c1c7ce]/30">
                      <th className="px-6 py-4 text-xs font-bold text-[#72787e] uppercase tracking-wider">Navn & E-post</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#72787e] uppercase tracking-wider">Rolle</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#72787e] uppercase tracking-wider">Opprettet</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#72787e] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#72787e] uppercase tracking-wider text-right">Handlinger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c1c7ce]/20">
                    {currentUsers.length > 0 ? (
                      currentUsers.map(userItem => (
                        <tr 
                          key={userItem.uid}
                          className="hover:bg-[#f6fafe]/60 transition-colors"
                        >
                          {/* Name & Email */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {userItem.avatar ? (
                                <img
                                  src={userItem.avatar}
                                  alt={userItem.name}
                                  className="w-10 h-10 rounded-full border border-[#c1c7ce] object-cover shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#561291]/10 flex items-center justify-center font-bold text-[#561291] text-xs shadow-inner">
                                  {(userItem.name || '').split(' ').map(n=>n[0] || '').join('').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-sm text-[#561291]">{userItem.name}</p>
                                <p className="text-xs text-[#72787e]">{userItem.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Selection */}
                          <td className="px-6 py-4">
                            {userItem.email?.toLowerCase() === 'knutsenthomas@gmail.com' ? (
                              <span className="text-xs font-bold text-[#ba1a1a] bg-red-50 border border-red-200 rounded-lg px-2.5 py-1">
                                Super Admin (Låst)
                              </span>
                            ) : (
                              <select
                                value={userItem.role}
                                onChange={(e) => handleUpdateUserRole(userItem.uid, e.target.value)}
                                className="bg-[#f0f4f8] border-none text-xs font-semibold text-[#561291] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#561291] transition-all outline-none"
                              >
                                <option value="student">Student</option>
                                <option value="teacher">Lærer / Mentor</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                              </select>
                            )}
                          </td>

                          {/* Created */}
                          <td className="px-6 py-4 text-xs font-semibold text-[#41474d]">
                            {userItem.created || "01. Jan 2024"}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {userItem.email?.toLowerCase() === 'knutsenthomas@gmail.com' ? (
                              <span className="text-[10px] font-bold rounded-full px-3 py-1 bg-green-100 text-green-800 border border-green-200">
                                AKTIV
                              </span>
                            ) : (
                              <select
                                value={userItem.status}
                                onChange={(e) => handleUpdateUserStatus(userItem.uid, e.target.value)}
                                className={`text-[10px] font-bold rounded-full px-3 py-1 outline-none border-none focus:ring-1 focus:ring-[#561291] cursor-pointer ${
                                  userItem.status === 'AKTIV' ? 'bg-green-100 text-green-800' :
                                  userItem.status === 'VENTER' ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                <option value="AKTIV">AKTIV</option>
                                <option value="VENTER">VENTER</option>
                                <option value="INAKTIV">INAKTIV</option>
                              </select>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(userItem.email);
                                  showToast("E-post kopiert til utklippstavlen!");
                                }}
                                className="p-1.5 hover:text-[#561291] text-[#72787e] transition-colors hover:bg-slate-100 rounded-lg"
                                title="Kopier E-post"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              
                              {userItem.email?.toLowerCase() !== 'knutsenthomas@gmail.com' && (
                                <button
                                  onClick={() => handleDeleteUser(userItem.uid, userItem.name)}
                                  className="p-1.5 hover:text-[#ba1a1a] text-[#72787e] transition-colors hover:bg-red-50 rounded-lg"
                                  title="Slett Bruker"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-[#72787e] font-semibold">
                          Ingen brukere funnet som samsvarer med søkekriteriene.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="bg-[#eaeef2]/40 px-6 py-4 border-t border-[#c1c7ce]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#72787e] font-semibold">
                  Viser {filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0} til {Math.min(indexOfLastUser, filteredUsers.length)} av {filteredUsers.length} brukere
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-[#c1c7ce]/60 rounded-lg text-[#46617b] disabled:opacity-30 hover:bg-[#eaeef2] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? 'bg-[#561291] text-white shadow-sm font-bold'
                          : 'text-[#46617b] hover:bg-[#eaeef2]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-[#c1c7ce]/60 rounded-lg text-[#46617b] disabled:opacity-30 hover:bg-[#eaeef2] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Academic Widgets Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-white border-l-4 border-[#561291] p-6 rounded-r-2xl border border-[#c1c7ce]/40 shadow-sm space-y-2">
                <div className="flex items-center gap-3 text-[#561291]">
                  <Info className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm">Lisensstatus</h3>
                </div>
                <p className="text-xs text-[#41474d] leading-relaxed">
                  Du bruker for øyeblikket 84% av dine tilgjengelige studentlisenser. Vurder å oppgradere før neste semester.
                </p>
              </div>
              <div className="bg-white border-l-4 border-[#561291] p-6 rounded-r-2xl border border-[#c1c7ce]/40 shadow-sm space-y-2">
                <div className="flex items-center gap-3 text-[#561291]">
                  <Key className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm">Pro-tips for administratorer</h3>
                </div>
                <p className="text-xs text-[#41474d] leading-relaxed">
                  Du kan importere brukere i bulk ved å laste opp en CSV-fil formatert etter malen i hjelpesenteret.
                </p>
              </div>
              <div className="bg-white border-l-4 border-[#ba1a1a] p-6 rounded-r-2xl border border-[#c1c7ce]/40 shadow-sm space-y-2">
                <div className="flex items-center gap-3 text-[#ba1a1a]">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm">Sikkerhetslogg varsel</h3>
                </div>
                <p className="text-xs text-[#41474d] leading-relaxed">
                  Det har vært 3 mislykkede innloggingsforsøk fra ukjente IP-adresser det siste døgnet.
                </p>
              </div>
            </div>

          </motion.div>
        ) : activeTab === 'admissions' ? (
          <motion.div
            key="admissions-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* 1. MASTER TOGGLE & CONTROL CARD */}
            <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#561291]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D7B978]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#561291] bg-[#561291]/10 px-3 py-1 rounded-full">
                      Hovedbryter for opptak
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                      admissionFormOpen 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${admissionFormOpen ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                      {admissionFormOpen ? 'Søknadsskjema er ÅPENT' : 'Søknadsskjema er LÅST (1. jan 2027)'}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#561291] tracking-tight">
                    {admissionFormOpen 
                      ? 'Skjemaet er åpent for alle søkere' 
                      : 'Skjemaet er låst for vanlige besøkende'}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {admissionFormOpen ? (
                      <>
                        Søknadsportalen på <span className="font-bold text-[#561291]">/admission</span> er nå fullstendig åpen for publikum. Alle besøkende kan fylle ut de 4 stegene og sende inn sin søknad. Slå av bryteren for å sette skjemaet tilbake til planlagt modus (1. januar 2027).
                      </>
                    ) : (
                      <>
                        Vanlige besøkende ser informasjonssiden og inviteres til å registrere e-post for påminnelse. Søknadsskjemaet åpner automatisk <span className="font-bold text-[#561291]">1. januar 2027</span>. Du kan når som helst åpne skjemaet for alle ved å slå på toggle-bryteren her.
                      </>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href="/admission"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#561291] text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
                    >
                      <ExternalLink size={14} />
                      <span>Åpne søknadssiden</span>
                    </a>
                    <a
                      href="/admission?preview=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
                    >
                      <Eye size={14} />
                      <span>Forhåndsvis som søker</span>
                    </a>
                    <button
                      type="button"
                      onClick={fetchAdmissionsData}
                      disabled={isLoadingAdmissions}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-[#561291] text-xs font-medium rounded-xl hover:bg-slate-50 transition-all"
                    >
                      <RefreshCw size={13} className={isLoadingAdmissions ? "animate-spin" : ""} />
                      <span>Oppdater data</span>
                    </button>
                  </div>
                </div>

                {/* THE TOGGLE SWITCH */}
                <div className="bg-slate-50 border border-slate-200/80 p-5 sm:p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shrink-0 min-w-[260px] text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Manuell Åpningsbryter
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={admissionFormOpen}
                    disabled={isTogglingAdmission}
                    onClick={handleToggleAdmissionForm}
                    className={`w-20 h-11 flex items-center rounded-full p-1.5 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-[#561291]/20 shadow-inner ${
                      admissionFormOpen ? 'bg-green-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                    title={admissionFormOpen ? "Klikk for å låse/stenge skjemaet" : "Klikk for å åpne skjemaet for alle"}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="bg-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-[#561291]"
                    >
                      {admissionFormOpen ? (
                        <Check size={18} className="text-green-600 stroke-[3]" />
                      ) : (
                        <Lock size={15} className="text-slate-500" />
                      )}
                    </motion.div>
                  </button>

                  <div className="space-y-0.5">
                    <span className={`text-sm font-extrabold block ${admissionFormOpen ? 'text-green-700' : 'text-slate-700'}`}>
                      {admissionFormOpen ? 'PÅ (Skjema er ÅPENT)' : 'AV (Skjema er LÅST)'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal block">
                      {admissionFormOpen ? 'Klikk for å låse' : 'Klikk for å åpne for alle nå'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KPI / STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-outline-variant/40 p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-[#561291]">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Mottatte søknader</p>
                  <FileText size={18} />
                </div>
                <p className="text-3xl font-serif font-bold text-[#561291]">{applicationsList.length}</p>
                <p className="text-xs text-slate-500">Innsendte skjemaer via nettsiden</p>
              </div>

              <div className="bg-white border border-outline-variant/40 p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-[#561291]">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Interesseliste</p>
                  <Mail size={18} />
                </div>
                <p className="text-3xl font-serif font-bold text-[#561291]">{leadsList.length}</p>
                <p className="text-xs text-slate-500">Registrert for forhåndsvarsel</p>
              </div>

              <div className="bg-white border border-outline-variant/40 p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-[#561291]">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Ordinær åpning</p>
                  <Calendar size={18} />
                </div>
                <p className="text-2xl font-serif font-bold text-slate-800">1. jan 2027</p>
                <p className="text-xs text-slate-500">Automatisk låsing før denne dato</p>
              </div>

              <div className="bg-white border border-outline-variant/40 p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-[#561291]">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Søknadsfrist</p>
                  <Clock size={18} />
                </div>
                <p className="text-2xl font-serif font-bold text-slate-800">30. juni 2027</p>
                <p className="text-xs text-slate-500">Fortløpende opptaksevaluering</p>
              </div>
            </div>

            {/* 3. DATA TABLES WITH SUB-TABS */}
            <div className="bg-white border border-outline-variant/40 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div className="flex bg-[#eaeef2] p-1 rounded-xl">
                  <button
                    onClick={() => setAdmissionsSubTab('applications')}
                    className={`px-4 py-2 rounded-lg text-xs uppercase font-bold tracking-wider transition-all ${
                      admissionsSubTab === 'applications' ? 'bg-white text-[#561291] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Innsendte Søknader ({applicationsList.length})
                  </button>
                  <button
                    onClick={() => setAdmissionsSubTab('leads')}
                    className={`px-4 py-2 rounded-lg text-xs uppercase font-bold tracking-wider transition-all ${
                      admissionsSubTab === 'leads' ? 'bg-white text-[#561291] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Varslingsliste ({leadsList.length})
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Søk i listen..."
                      value={admissionsSearch}
                      onChange={(e) => setAdmissionsSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#561291] outline-none"
                    />
                  </div>

                  {admissionsSubTab === 'applications' ? (
                    <button
                      onClick={exportApplicationsCsv}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#561291] hover:bg-[#430d72] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                      title="Last ned CSV (UTF-8 BOM, semi-kolon)"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Eksporter CSV</span>
                    </button>
                  ) : (
                    <button
                      onClick={exportLeadsCsv}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#561291] hover:bg-[#430d72] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                      title="Last ned CSV (UTF-8 BOM, semi-kolon)"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Eksporter CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-tab 1: Applications */}
              {admissionsSubTab === 'applications' && (
                <div className="overflow-x-auto">
                  {applicationsList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <GraduationCap size={40} className="mx-auto text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">Ingen søknader mottatt enda</p>
                      <p className="text-xs max-w-sm mx-auto">
                        Når søkere fyller ut skjemaet på nettsiden, lagres de automatisk her i sanntid.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-3">Søker</th>
                          <th className="py-3 px-3">Kontakt</th>
                          <th className="py-3 px-3">Studielinje</th>
                          <th className="py-3 px-3">Betaling</th>
                          <th className="py-3 px-3">Dato</th>
                          <th className="py-3 px-3 text-right">Handling</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {applicationsList
                          .filter(app => {
                            if (!admissionsSearch.trim()) return true;
                            const q = admissionsSearch.toLowerCase();
                            return (
                              (app.name || '').toLowerCase().includes(q) ||
                              (app.email || '').toLowerCase().includes(q) ||
                              (app.phone || '').toLowerCase().includes(q) ||
                              (app.program || '').toLowerCase().includes(q)
                            );
                          })
                          .map(app => (
                            <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-3 font-semibold text-slate-800">
                                <div>{app.name || 'Ukjent navn'}</div>
                                <div className="text-[11px] text-slate-500 font-normal">{app.email}</div>
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                <div>{app.phone || '–'}</div>
                                <div className="text-[11px] text-slate-400">{app.address || ''}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="inline-block px-2.5 py-1 bg-[#561291]/10 text-[#561291] font-bold rounded-lg text-[11px]">
                                  {app.program === 'prophetic_community' ? 'PROP 101' :
                                   app.program === 'bible_deep_dive' ? 'BIBLE 301' :
                                   app.program === 'fivefold_ministry' ? 'MIN 201' : (app.program || 'Ikke spesifisert')}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 capitalize">
                                {app.paymentPlan === 'semester' ? 'Semestervis' : app.paymentPlan === 'yearly' ? 'Fullt år' : (app.paymentPlan || '–')}
                              </td>
                              <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                                {app.submittedAt?.toDate?.() ? app.submittedAt.toDate().toLocaleDateString('no-NO') : (app.date || '–')}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedApplication(app)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#561291] hover:text-white text-[#561291] font-bold rounded-lg transition-colors text-xs inline-flex items-center gap-1"
                                >
                                  <Eye size={13} />
                                  <span>Vis</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Leads / Reminder Signups */}
              {admissionsSubTab === 'leads' && (
                <div className="overflow-x-auto">
                  {leadsList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Mail size={40} className="mx-auto text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">Ingen registrert for forhåndsvarsel enda</p>
                      <p className="text-xs max-w-sm mx-auto">
                        Besøkende som legger igjen navn og e-post mens søknadsskjemaet er låst havner automatisk her.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-3">Navn</th>
                          <th className="py-3 px-3">E-post</th>
                          <th className="py-3 px-3">Kilde</th>
                          <th className="py-3 px-3">Registrert</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {leadsList
                          .filter(lead => {
                            if (!admissionsSearch.trim()) return true;
                            const q = admissionsSearch.toLowerCase();
                            return (
                              (lead.name || '').toLowerCase().includes(q) ||
                              (lead.email || '').toLowerCase().includes(q)
                            );
                          })
                          .map(lead => (
                            <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-3 font-semibold text-slate-800">
                                {lead.name || '–'}
                              </td>
                              <td className="py-3 px-3 text-[#561291] font-medium">
                                <a href={`mailto:${lead.email}`} className="hover:underline">
                                  {lead.email}
                                </a>
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                  {lead.source || 'admission_portal_reminder_2027'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                                {lead.createdAt?.toDate?.() ? lead.createdAt.toDate().toLocaleDateString('no-NO') : (lead.date || '–')}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="permissions-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Global Role Selection Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs text-[#72787e] font-bold uppercase tracking-widest">Velg rolle for rettighetsstyring</p>
                <button
                  onClick={() => showToast("Vennligst opprett rollen i Firestore før du konfigurerer rettigheter.")}
                  className="flex items-center gap-1.5 text-xs text-[#561291] hover:underline font-bold"
                >
                  <Plus className="w-4 h-4" />
                  Lag tilpasset rolle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Student role card */}
                <div 
                  onClick={() => setSelectedRole('student')}
                  className={`bg-white border-2 rounded-2xl p-5 hover:bg-[#f6fafe]/50 cursor-pointer shadow-sm relative overflow-hidden transition-all group ${
                    selectedRole === 'student' ? 'border-[#561291] ring-2 ring-[#561291]/10 bg-[#f3e8ff]/10' : 'border-[#c1c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="p-2 rounded-lg bg-[#eaeef2] text-[#41474d]">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#561291]">Student</h3>
                  </div>
                  <p className="text-[11px] text-[#72787e] leading-relaxed">
                    Utrustningsgrensesnitt. Har tilgang til kurs, leksjoner og studiegrupper.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase bg-slate-100 text-[#46617b] px-2.5 py-0.5 rounded-full">Begrenset rolle</span>
                    <span className="text-[10px] text-[#72787e] font-bold">2,450 Brukere</span>
                  </div>
                </div>

                {/* Teacher role card */}
                <div 
                  onClick={() => setSelectedRole('teacher')}
                  className={`bg-white border-2 rounded-2xl p-5 hover:bg-[#f6fafe]/50 cursor-pointer shadow-sm relative overflow-hidden transition-all group ${
                    selectedRole === 'teacher' ? 'border-[#561291] ring-2 ring-[#561291]/10 bg-[#f3e8ff]/10' : 'border-[#c1c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="p-2 rounded-lg bg-[#eaeef2] text-[#41474d]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#561291]">Lærer / Mentor</h3>
                  </div>
                  <p className="text-[11px] text-[#72787e] leading-relaxed">
                    Undervisning og evaluering. Kan rette oppgaver og administrere klasser.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase bg-[#f3e8ff] text-[#561291] px-2.5 py-0.5 rounded-full">Akademisk</span>
                    <span className="text-[10px] text-[#72787e] font-bold">148 Brukere</span>
                  </div>
                </div>

                {/* Admin role card */}
                <div 
                  onClick={() => setSelectedRole('admin')}
                  className={`bg-white border-2 rounded-2xl p-5 hover:bg-[#f6fafe]/50 cursor-pointer shadow-sm relative overflow-hidden transition-all group ${
                    selectedRole === 'admin' ? 'border-[#561291] ring-2 ring-[#561291]/10 bg-[#f3e8ff]/10' : 'border-[#c1c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="p-2 rounded-lg bg-[#eaeef2] text-[#41474d]">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#561291]">Administrator</h3>
                  </div>
                  <p className="text-[11px] text-[#72787e] leading-relaxed">
                    Plattformledelse. Har full tilgang til CMS, videoer og analyse.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">Sikkerhetsrolle</span>
                    <span className="text-[10px] text-[#72787e] font-bold">12 Brukere</span>
                  </div>
                </div>

                {/* Super Admin role card */}
                <div 
                  onClick={() => setSelectedRole('superadmin')}
                  className={`bg-white border-2 rounded-2xl p-5 hover:bg-[#f6fafe]/50 cursor-pointer shadow-sm relative overflow-hidden transition-all group ${
                    selectedRole === 'superadmin' ? 'border-[#561291] ring-2 ring-[#561291]/10 bg-[#f3e8ff]/10' : 'border-[#c1c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="p-2 rounded-lg bg-[#eaeef2] text-[#41474d]">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#561291]">Super Administrator</h3>
                  </div>
                  <p className="text-[11px] text-[#72787e] leading-relaxed">
                    Eierkonto. Kan endre systeminnstillinger, API-nøkler og slette data.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">Eier</span>
                    <span className="text-[10px] text-[#72787e] font-bold">3 Brukere</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Config detailed matrix layout */}
            <div className="bg-white border border-[#c1c7ce]/40 rounded-3xl overflow-hidden shadow-sm">
              <div className="border-b border-[#c1c7ce]/30 bg-[#eaeef2]/40 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-6 text-xs uppercase tracking-wider font-bold text-[#72787e]">
                  <button className="text-[#561291] border-b-2 border-[#561291] pb-4 -mb-[18px]">Rettighetsmatrise</button>
                  <button onClick={() => showToast("Visning av tildelte brukere er utilgjengelig offline.")} className="hover:text-[#561291] pb-4 -mb-[18px]">Tildelte Brukere</button>
                  <button onClick={() => showToast("Sikkerhetsloggen laster inn...")} className="hover:text-[#561291] pb-4 -mb-[18px]">Endringslogg</button>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#46617b]">
                  <Info className="w-4 h-4 text-[#561291]" />
                  <span>Modifisering av '{selectedRole.toUpperCase()}' påvirker alle brukere i denne gruppen.</span>
                </div>
              </div>

              {/* Grid content inside detailed matrix */}
              <div className="p-6 md:p-8 grid grid-cols-12 gap-8">
                
                {/* Left Rail */}
                <div className="col-span-12 md:col-span-3 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#72787e] mb-4">Rettighetsgrupper</h4>
                  {[
                    { id: 'course', name: 'Kursutvikling', icon: BookOpen },
                    { id: 'user', name: 'Brukerhåndtering', icon: Users },
                    { id: 'media', name: 'Mediebibliotek', icon: Video },
                    { id: 'analytics', name: 'Analyse & Rapporter', icon: BarChart3 },
                    { id: 'security', name: 'Sikkerhet & API', icon: Database }
                  ].map(cat => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActivePermissionGroup(cat.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all text-left ${
                          activePermissionGroup === cat.id
                            ? 'bg-[#561291] text-white shadow-md'
                            : 'text-[#41474d] hover:bg-[#f0f4f8] hover:text-[#561291]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CatIcon className="w-4 h-4" />
                          <span>{cat.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-55" />
                      </button>
                    );
                  })}
                </div>

                {/* Right checklist toggles */}
                <div className="col-span-12 md:col-span-9 space-y-6">
                  <div className="flex justify-between items-center border-b border-[#c1c7ce]/30 pb-3">
                    <h3 className="font-serif text-lg font-bold text-[#561291]">
                      {activePermissionGroup === 'course' ? 'Rettigheter for Kursutvikling' :
                       activePermissionGroup === 'user' ? 'Rettigheter for Brukerhåndtering' :
                       activePermissionGroup === 'media' ? 'Rettigheter for Mediebibliotek' :
                       activePermissionGroup === 'analytics' ? 'Rettigheter for Analyse & Rapporter' :
                       'Rettigheter for Sikkerhet & Database API'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#72787e] font-semibold">Tillat alle</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={Object.values(groupPermissions).every(v=>v)}
                          onChange={() => {
                            const currentVal = Object.values(groupPermissions).every(v=>v);
                            const updatedGroup = {};
                            Object.keys(groupPermissions).forEach(k => {
                              updatedGroup[k] = !currentVal;
                            });
                            setPermissionsMatrix(prev => {
                              const prevRole = prev?.[selectedRole] || DEFAULT_PERMISSIONS[selectedRole] || {};
                              return {
                                ...prev,
                                [selectedRole]: {
                                  ...prevRole,
                                  [activePermissionGroup]: updatedGroup
                                }
                              };
                            });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#561291]" />
                      </label>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-4">
                    {Object.keys(groupPermissions).map(capKey => {
                      let title = "";
                      let description = "";
                      let isHighRisk = false;

                      if (activePermissionGroup === 'course') {
                        if (capKey === 'create') { title = "Opprette nye kurs og moduler"; description = "Tillater brukeren å initiere nye studieplaner og definere innholdsrammer."; }
                        else if (capKey === 'publish') { title = "Publisere og avpublisere moduler"; description = "Kontrollerer synlighet for publiserte lærehefter og videoforelesninger overfor elever."; }
                        else { title = "Permanent sletting av kursdata"; description = "Sletting av kursinnhold, leksjonsfiler og arkiver fra systemets primære database."; isHighRisk = true; }
                      } else if (activePermissionGroup === 'user') {
                        if (capKey === 'invite') { title = "Invitere nye administratorer"; description = "Opprette og sende invitasjoner to nye systemadministratorer."; }
                        else if (capKey === 'changeRole') { title = "Endre brukerroller direkte"; description = "Oppgradere eller nedgradere brukerrettigheter mellom Student, Mentor og Admin."; }
                        else { title = "Deaktivere eller slette kontoer"; description = "Midlertidig frysing eller fullstendig fjerning av brukerprofiler og lisenser."; isHighRisk = true; }
                      } else if (activePermissionGroup === 'media') {
                        if (capKey === 'upload') { title = "Laste opp videoer og mediefiler"; description = "Tillater opplasting av tunge filer direkte til Google Cloud Storage bøtter."; }
                        else if (capKey === 'editMeta') { title = "Redigere bildetekster og metadata"; description = "Justere beskrivelser, søkeord og kategorisering for lagret medieinnhold."; }
                        else { title = "Fjerne filer permanent fra lagring"; description = "Slette opplastede mediefiler og frigjøre lagringsplass i nettskyen."; isHighRisk = true; }
                      } else if (activePermissionGroup === 'analytics') {
                        if (capKey === 'viewReports') { title = "Se globale progresjonsrapporte"; description = "Tilgang til statistikk og grafiske analyser over alle kursdeltakernes fremgang."; }
                        else if (capKey === 'exportFinancials') { title = "Eksportere økonomiske revisjoner"; description = "Generere og laste ned CSV- og PDF-filer med lisenshistorikk og betalinger."; }
                        else { title = "Nullstille studentstatistikk globalt"; description = "Fjerne fremgangsdata og restarte studiestatistikk for nye semestre."; isHighRisk = true; }
                      } else {
                        if (capKey === 'manageDb') { title = "Administrere database og skjemaer"; description = "Gjøre direkte endringer på Firestore-samlinger, relasjoner og regelsett."; isHighRisk = true; }
                        else if (capKey === 'viewLogs') { title = "Se sikkerhetslogger i sanntid"; description = "Overvåke IP-adresser, systeminnlogginger og sensitive handlinger foretatt av admins."; }
                        else { title = "Tømme og fylle systemcache"; description = "Gjennomføre manuell oppdatering av cachen for å tvinge innhenting av nye data."; }
                      }

                      return (
                        <div 
                          key={capKey} 
                          className="flex items-start justify-between p-5 bg-[#f6fafe] border border-[#c1c7ce]/30 rounded-2xl hover:border-[#561291]/40 transition-all gap-4"
                        >
                          <div className="flex gap-4">
                            <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#c1c7ce]/30 text-[#561291]">
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-[#561291]">{title}</h5>
                              <p className="text-xs text-[#72787e] mt-1 leading-relaxed">{description}</p>
                              
                              <div className="flex gap-2 mt-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-[#46617b] px-2 py-0.5 rounded-md">
                                  {activePermissionGroup.toUpperCase()}
                                </span>
                                {isHighRisk && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider bg-red-100 text-[#ba1a1a] px-2 py-0.5 rounded-md">
                                    Høy Risiko
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer mt-1 shrink-0">
                            <input 
                              type="checkbox"
                              checked={groupPermissions[capKey] || false}
                              onChange={() => togglePermission(selectedRole, activePermissionGroup, capKey)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#561291]" />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Save footer */}
              <div className="bg-[#eaeef2]/40 px-6 py-4 border-t border-[#c1c7ce]/30 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setPermissionsMatrix(DEFAULT_PERMISSIONS);
                    showToast("Gjenopprettet standard rettighetsmatrise!");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#c1c7ce] rounded-xl text-xs font-bold text-[#46617b] hover:bg-slate-100 transition-all active:scale-[0.98]"
                >
                  <Undo className="w-4 h-4" />
                  Nullstill Standard
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#561291] text-white hover:opacity-95 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Lagre Endringer
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD USER MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-[#561291]/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-outline-variant/50 max-w-md w-full p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-[#72787e] hover:text-[#561291] transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-[#561291] mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#561291]" />
                Legg til ny bruker
              </h3>
              <p className="text-xs text-[#72787e] mb-6">
                Opprett en ny profil manuelt. Brukeren blir øyeblikkelig registrert i databasen.
              </p>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="form-field-stable">
                  <label className="block text-[10px] font-bold text-[#41474d] uppercase tracking-wider mb-2">Navn</label>
                  <input
                    type="text"
                    required
                    placeholder="Anders Berg"
                    value={newUserName}
                    onChange={(e)=>setNewUserName(e.target.value)}
                    className="w-full bg-[#f6fafe] border border-[#c1c7ce]/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#561291] focus:outline-none transition-all"
                    style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  />
                </div>

                <div className="form-field-stable">
                  <label className="block text-[10px] font-bold text-[#41474d] uppercase tracking-wider mb-2">E-postadresse</label>
                  <input
                    type="email"
                    required
                    placeholder="anders@hiskingdomministry.no"
                    value={newUserEmail}
                    onChange={(e)=>setNewUserEmail(e.target.value)}
                    className="w-full bg-[#f6fafe] border border-[#c1c7ce]/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#561291] focus:outline-none transition-all"
                    style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-field-stable">
                    <label className="block text-[10px] font-bold text-[#41474d] uppercase tracking-wider mb-2">Rolle</label>
                    <select
                      value={newUserRole}
                      onChange={(e)=>setNewUserRole(e.target.value)}
                      className="w-full bg-[#f6fafe] border border-[#c1c7ce]/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#561291] focus:ring-2 focus:ring-[#561291] outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Lærer</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>

                  <div className="form-field-stable">
                    <label className="block text-[10px] font-bold text-[#41474d] uppercase tracking-wider mb-2">Status</label>
                    <select
                      value={newUserStatus}
                      onChange={(e)=>setNewUserStatus(e.target.value)}
                      className="w-full bg-[#f6fafe] border border-[#c1c7ce]/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#561291] focus:ring-2 focus:ring-[#561291] outline-none"
                    >
                      <option value="AKTIV">Aktiv</option>
                      <option value="VENTER">Venter</option>
                      <option value="INAKTIV">Inaktiv</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#c1c7ce]/30 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 border border-[#c1c7ce] rounded-xl text-xs font-bold text-[#46617b] hover:bg-slate-100 transition-all active:scale-[0.98]"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#561291] text-white hover:opacity-95 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md"
                  >
                    Opprett Bruker
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- APPLICATION DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedApplication && (
          <div className="fixed inset-0 bg-[#561291]/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-outline-variant/50 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedApplication(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-[#72787e] hover:text-[#561291] transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-[#561291]/10 text-[#561291] px-2.5 py-0.5 rounded-md">
                    Søknadsdetaljer
                  </span>
                  <span className="text-xs text-slate-400">ID: {selectedApplication.id}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#561291]">
                  {selectedApplication.name || 'Ukjent søker'}
                </h3>
                <p className="text-xs text-slate-500">
                  Innsendt: {selectedApplication.submittedAt?.toDate?.() ? selectedApplication.submittedAt.toDate().toLocaleString('no-NO') : (selectedApplication.date || '–')}
                </p>
              </div>

              <div className="space-y-6 text-sm">
                {/* Personalia */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#561291] border-b border-slate-100 pb-1">
                    1. Personalia & Kontakt
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-400 block">E-post:</span> <span className="font-semibold text-slate-800">{selectedApplication.email || '–'}</span></div>
                    <div><span className="text-slate-400 block">Telefon:</span> <span className="font-semibold text-slate-800">{selectedApplication.phone || '–'}</span></div>
                    <div><span className="text-slate-400 block">Fødselsdato:</span> <span className="font-semibold text-slate-800">{selectedApplication.birthDate || '–'}</span></div>
                    <div><span className="text-slate-400 block">Kjønn:</span> <span className="font-semibold text-slate-800">{selectedApplication.gender || '–'}</span></div>
                    <div><span className="text-slate-400 block">Sivilstatus:</span> <span className="font-semibold text-slate-800">{selectedApplication.maritalStatus || '–'}</span></div>
                    <div><span className="text-slate-400 block">Yrke/Stilling:</span> <span className="font-semibold text-slate-800">{selectedApplication.occupation || '–'}</span></div>
                    <div className="sm:col-span-2"><span className="text-slate-400 block">Adresse:</span> <span className="font-semibold text-slate-800">{selectedApplication.address || '–'}</span></div>
                  </div>
                </div>

                {/* Studielinje */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#561291] border-b border-slate-100 pb-1">
                    2. Valgt Studielinje
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Studieprogram:</span>
                      <span className="font-bold text-[#561291]">
                        {selectedApplication.program === 'prophetic_community' ? 'PROP 101 – Innføring i den Profetiske Tjeneste' :
                         selectedApplication.program === 'bible_deep_dive' ? 'BIBLE 301 – Avansert Hermeneutikk & Tolkning' :
                         selectedApplication.program === 'fivefold_ministry' ? 'MIN 201 – Praktisk Tjenestegave-lederskap' : (selectedApplication.program || '–')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Betalingsplan:</span>
                      <span className="font-semibold text-slate-800 capitalize">{selectedApplication.paymentPlan || '–'}</span>
                    </div>
                  </div>
                </div>

                {/* Åndelig bakgrunn */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#561291] border-b border-slate-100 pb-1">
                    3. Åndelig Bakgrunn & Motivasjon
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Hvorfor søker du HKPC?</span>
                      <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                        {selectedApplication.whySeeking || 'Ikke oppgitt'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Forventninger til studieåret:</span>
                      <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                        {selectedApplication.expectations || 'Ikke oppgitt'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Frelseserfaring & dåp:</span>
                      <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                        {selectedApplication.salvationExperience || 'Ikke oppgitt'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Menighetstilknytning:</span>
                      <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                        {selectedApplication.churchAffiliation || 'Ikke oppgitt'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Referanse */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#561291] border-b border-slate-100 pb-1">
                    4. Referanseperson
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-400 block">Navn:</span> <span className="font-semibold text-slate-800">{selectedApplication.referenceName || '–'}</span></div>
                    <div><span className="text-slate-400 block">Rolle / Relasjon:</span> <span className="font-semibold text-slate-800">{selectedApplication.referenceRole || '–'}</span></div>
                    <div><span className="text-slate-400 block">E-post:</span> <span className="font-semibold text-slate-800">{selectedApplication.referenceEmail || '–'}</span></div>
                    <div><span className="text-slate-400 block">Telefon:</span> <span className="font-semibold text-slate-800">{selectedApplication.referencePhone || '–'}</span></div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="px-5 py-2.5 bg-[#561291] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-sm"
                >
                  Lukk
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
