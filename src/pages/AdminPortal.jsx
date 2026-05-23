import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, ShieldAlert, Check, Search, Download, Plus, 
  Trash2, Edit3, Filter, Lock, BookOpen, Video, BarChart3, 
  Database, Save, Undo, Mail, Calendar, Info, HelpCircle, 
  AlertTriangle, Key, ChevronLeft, ChevronRight, X
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
  const { user: currentUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'permissions'
  
  // Guard Check
  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  // --- TAB 1: USERS STATE ---
  const [usersList, setUsersList] = useState([]);
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

  // --- TAB 2: PERMISSIONS STATE ---
  const [selectedRole, setSelectedRole] = useState('admin');
  const [activePermissionGroup, setActivePermissionGroup] = useState('course'); // 'course' | 'user' | 'media' | 'analytics' | 'security'
  const [permissionsMatrix, setPermissionsMatrix] = useState(DEFAULT_PERMISSIONS);

  // Sync users database
  useEffect(() => {
    if (!isAuthorized) return;
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        if (querySnapshot.empty) {
          // Seed initial demo users to Firestore
          const list = [...DEFAULT_USERS];
          for (const u of list) {
            await setDoc(doc(db, "users", u.uid), u);
          }
          setUsersList(list);
          localStorage.setItem('hkm-admin-portal-users', JSON.stringify(list));
        } else {
          const loaded = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
          setUsersList(loaded);
          localStorage.setItem('hkm-admin-portal-users', JSON.stringify(loaded));
        }
      } catch (err) {
        console.warn("Firestore fetch failed, loading local/offline state:", err);
        const cached = localStorage.getItem('hkm-admin-portal-users');
        if (cached) {
          setUsersList(JSON.parse(cached));
        } else {
          setUsersList(DEFAULT_USERS);
        }
      }
    };
    fetchUsers();
  }, [isAuthorized]);

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
      <div className="min-h-screen bg-[#f6fafe] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-[#c1c7ce] max-w-md w-full shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-red-50 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#00324b]">Adgang Avvist</h2>
          <p className="text-sm text-[#41474d] leading-relaxed">
            Kun administratorer og super admin har tilgang til denne portalen. Vennligst logg på med en autorisert konto for å administrere systemet.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-[#00324b] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow"
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
    <div className="min-h-screen bg-[#f6fafe] p-4 sm:p-8 max-w-[1440px] mx-auto text-[#171c1f]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-[#c1c7ce]/40 pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#00324b] mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-sm text-[#46617b]">
            Overordnet system- og brukerhåndtering for His Kingdom Prophets.
          </p>
        </div>
        
        {/* Tab Selection */}
        <div className="flex bg-[#eaeef2] p-1 rounded-full relative">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all relative z-10 ${
              activeTab === 'users' ? 'text-[#00324b] font-bold' : 'text-[#41474d] hover:text-[#171c1f]'
            }`}
          >
            Brukerhåndtering
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all relative z-10 ${
              activeTab === 'permissions' ? 'text-[#00324b] font-bold' : 'text-[#41474d] hover:text-[#171c1f]'
            }`}
          >
            Rettighetsstyring
          </button>
          
          <motion.div
            className="absolute top-1 bottom-1 left-1 bg-white rounded-full shadow-sm"
            layoutId="portalTabIndicator"
            style={{ width: activeTab === 'users' ? 'calc(50% - 4px)' : 'calc(50% - 4px)' }}
            animate={{ x: activeTab === 'users' ? '0%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
              <div className="bg-white border border-[#c1c7ce]/40 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-[#72787e] font-bold uppercase tracking-wider">Totalt antall brukere</p>
                <p className="text-3xl font-serif font-bold text-[#00324b] mt-2">{(usersList || []).length}</p>
              </div>
              <div className="bg-white border border-[#c1c7ce]/40 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-[#72787e] font-bold uppercase tracking-wider">Studenter</p>
                <p className="text-3xl font-serif font-bold text-[#1b4965] mt-2">{(usersList || []).filter(u=>u?.role==='student').length}</p>
              </div>
              <div className="bg-white border border-[#c1c7ce]/40 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-[#72787e] font-bold uppercase tracking-wider">Mentorer / Lærere</p>
                <p className="text-3xl font-serif font-bold text-[#46617b] mt-2">{(usersList || []).filter(u=>u?.role==='teacher').length}</p>
              </div>
              <div className="bg-white border border-[#c1c7ce]/40 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-[#72787e] font-bold uppercase tracking-wider">Administratorer</p>
                <p className="text-3xl font-serif font-bold text-[#001e2f] mt-2">{(usersList || []).filter(u=>u?.role==='admin' || u?.role==='superadmin').length}</p>
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
                    className="w-full bg-[#f0f4f8] border border-[#c1c7ce]/60 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1b4965] focus:outline-none transition-all"
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
                            ? 'bg-white text-[#00324b] shadow-sm' 
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
                    className="bg-[#eaeef2] border-none rounded-xl px-4 py-2 text-xs font-semibold text-[#00324b] focus:ring-2 focus:ring-[#1b4965] outline-none"
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#00324b] hover:opacity-95 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all shadow-md"
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
                                <div className="w-10 h-10 rounded-full bg-[#1b4965]/10 flex items-center justify-center font-bold text-[#1b4965] text-xs shadow-inner">
                                  {(userItem.name || '').split(' ').map(n=>n[0] || '').join('').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-sm text-[#00324b]">{userItem.name}</p>
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
                                className="bg-[#f0f4f8] border-none text-xs font-semibold text-[#00324b] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#1b4965] transition-all outline-none"
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
                                className={`text-[10px] font-bold rounded-full px-3 py-1 outline-none border-none focus:ring-1 focus:ring-[#1b4965] cursor-pointer ${
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
                                className="p-1.5 hover:text-[#00324b] text-[#72787e] transition-colors hover:bg-slate-100 rounded-lg"
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
                          ? 'bg-[#00324b] text-white shadow-sm font-bold'
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
              <div className="bg-white border-l-4 border-[#00324b] p-6 rounded-r-2xl border border-[#c1c7ce]/40 shadow-sm space-y-2">
                <div className="flex items-center gap-3 text-[#00324b]">
                  <Info className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm">Lisensstatus</h3>
                </div>
                <p className="text-xs text-[#41474d] leading-relaxed">
                  Du bruker for øyeblikket 84% av dine tilgjengelige studentlisenser. Vurder å oppgradere før neste semester.
                </p>
              </div>
              <div className="bg-white border-l-4 border-[#1b4965] p-6 rounded-r-2xl border border-[#c1c7ce]/40 shadow-sm space-y-2">
                <div className="flex items-center gap-3 text-[#1b4965]">
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
                  className="flex items-center gap-1.5 text-xs text-[#00324b] hover:underline font-bold"
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
                    selectedRole === 'student' ? 'border-[#00324b] ring-2 ring-[#00324b]/10 bg-[#cee5ff]/10' : 'border-[#c1c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="p-2 rounded-lg bg-[#eaeef2] text-[#41474d]">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#00324b]">Student</h3>
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
                    selectedRole === 'teacher' ? 'border-[#00324b] ring-2 ring-[#00324b]/10 bg-[#cee5ff]/10' : 'border-[#c1c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="p-2 rounded-lg bg-[#eaeef2] text-[#41474d]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#00324b]">Lærer / Mentor</h3>
                  </div>
                  <p className="text-[11px] text-[#72787e] leading-relaxed">
                    Undervisning og evaluering. Kan rette oppgaver og administrere klasser.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase bg-[#cee5ff] text-[#00324b] px-2.5 py-0.5 rounded-full">Akademisk</span>
                    <span className="text-[10px] text-[#72787e] font-bold">148 Brukere</span>
                  </div>
                </div>

                {/* Admin role card */}
                <div 
                  onClick={() => setSelectedRole('admin')}
                  className={`bg-white border-2 rounded-2xl p-5 hover:bg-[#f6fafe]/50 cursor-pointer shadow-sm relative overflow-hidden transition-all group ${
                    selectedRole === 'admin' ? 'border-[#00324b] ring-2 ring-[#00324b]/10 bg-[#cee5ff]/10' : 'border-[#c1c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="p-2 rounded-lg bg-[#eaeef2] text-[#41474d]">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#00324b]">Administrator</h3>
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
                    selectedRole === 'superadmin' ? 'border-[#00324b] ring-2 ring-[#00324b]/10 bg-[#cee5ff]/10' : 'border-[#c1c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="p-2 rounded-lg bg-[#eaeef2] text-[#41474d]">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#00324b]">Super Administrator</h3>
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
                  <button className="text-[#00324b] border-b-2 border-[#00324b] pb-4 -mb-[18px]">Rettighetsmatrise</button>
                  <button onClick={() => showToast("Visning av tildelte brukere er utilgjengelig offline.")} className="hover:text-[#00324b] pb-4 -mb-[18px]">Tildelte Brukere</button>
                  <button onClick={() => showToast("Sikkerhetsloggen laster inn...")} className="hover:text-[#00324b] pb-4 -mb-[18px]">Endringslogg</button>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#46617b]">
                  <Info className="w-4 h-4 text-[#1b4965]" />
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
                            ? 'bg-[#00324b] text-white shadow-md'
                            : 'text-[#41474d] hover:bg-[#f0f4f8] hover:text-[#00324b]'
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
                    <h3 className="font-serif text-lg font-bold text-[#00324b]">
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
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00324b]" />
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
                          className="flex items-start justify-between p-5 bg-[#f6fafe] border border-[#c1c7ce]/30 rounded-2xl hover:border-[#1b4965]/40 transition-all gap-4"
                        >
                          <div className="flex gap-4">
                            <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#c1c7ce]/30 text-[#00324b]">
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-[#00324b]">{title}</h5>
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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00324b]" />
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#00324b] text-white hover:opacity-95 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md"
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
          <div className="fixed inset-0 bg-[#001e2f]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-[#c1c7ce]/50 max-w-md w-full p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-[#72787e] hover:text-[#00324b] transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-[#00324b] mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1b4965]" />
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
                    className="w-full bg-[#f6fafe] border border-[#c1c7ce]/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1b4965] focus:outline-none transition-all"
                    style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  />
                </div>

                <div className="form-field-stable">
                  <label className="block text-[10px] font-bold text-[#41474d] uppercase tracking-wider mb-2">E-postadresse</label>
                  <input
                    type="email"
                    required
                    placeholder="anders@hiskingdomprophets.com"
                    value={newUserEmail}
                    onChange={(e)=>setNewUserEmail(e.target.value)}
                    className="w-full bg-[#f6fafe] border border-[#c1c7ce]/80 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1b4965] focus:outline-none transition-all"
                    style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-field-stable">
                    <label className="block text-[10px] font-bold text-[#41474d] uppercase tracking-wider mb-2">Rolle</label>
                    <select
                      value={newUserRole}
                      onChange={(e)=>setNewUserRole(e.target.value)}
                      className="w-full bg-[#f6fafe] border border-[#c1c7ce]/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#00324b] focus:ring-2 focus:ring-[#1b4965] outline-none"
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
                      className="w-full bg-[#f6fafe] border border-[#c1c7ce]/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#00324b] focus:ring-2 focus:ring-[#1b4965] outline-none"
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
                    className="px-6 py-2.5 bg-[#00324b] text-white hover:opacity-95 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md"
                  >
                    Opprett Bruker
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
