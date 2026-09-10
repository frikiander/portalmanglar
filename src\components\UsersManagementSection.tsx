import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  GraduationCap,
  LogIn,
  KeyRound,
  Sparkles,
  BookOpen,
  UserCheck,
  Power
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { User, UserRole } from '../types';
import { SCHOOL_GRADES } from '../data/mockRoster';

export const UsersManagementSection: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    setCurrentUser,
    setViewMode,
    currentUser,
    subjects,
    loginWithGoogleHandler,
    isLoggedInWithGoogle,
    logoutHandler,
    isAuthLoading,
    availableGradeNames,
    addToast
  } = useEduPlan();

  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : SCHOOL_GRADES;

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'coordinator'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Form states
  const [formEmail, setFormEmail] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('teacher');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formGrades, setFormGrades] = useState<string[]>(['1er Grado']);
  const [formSections, setFormSections] = useState<string[]>(['A']);
  const [formSubjects, setFormSubjects] = useState<string[]>([]);
  const [formPhone, setFormPhone] = useState('');
  const [formAvatar, setFormAvatar] = useState('');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormEmail('');
    setFormFullName('');
    setFormRole('teacher');
    setFormSpecialty(subjects[0]?.name || 'Matemática');
    setFormGrades(['1er Grado']);
    setFormSections(['A']);
    setFormSubjects([subjects[0]?.name || 'Matemática']);
    setFormPhone('');
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormFullName(user.fullName);
    setFormRole(user.role);
    setFormSpecialty(user.specialty || '');
    setFormGrades(user.assignedGrades || (user.schoolGrade ? [user.schoolGrade] : ['1er Grado']));
    setFormSections(user.assignedSections || ['A']);
    setFormSubjects(user.assignedSubjects || (user.specialty ? [user.specialty] : []));
    setFormPhone(user.phone || '');
    setFormAvatar(user.avatar || '');
    setIsFormModalOpen(true);
  };

  const handleToggleGrade = (grade: string) => {
    if (formGrades.includes(grade)) {
      if (formGrades.length > 1) {
        setFormGrades(formGrades.filter((g) => g !== grade));
      }
    } else {
      setFormGrades([...formGrades, grade]);
    }
  };

  const handleToggleSection = (section: string) => {
    if (formSections.includes(section)) {
      if (formSections.length > 1) {
        setFormSections(formSections.filter((s) => s !== section));
      }
    } else {
      setFormSections([...formSections, section]);
    }
  };

  const handleToggleSubject = (subjName: string) => {
    if (formSubjects.includes(subjName)) {
      setFormSubjects(formSubjects.filter((s) => s !== subjName));
    } else {
      setFormSubjects([...formSubjects, subjName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formFullName.trim()) return;

    const defaultAvatar = formAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    if (editingUser) {
      await updateUser({
        ...editingUser,
        email: formEmail.trim().toLowerCase(),
        fullName: formFullName.trim(),
        role: formRole,
        specialty: formSpecialty.trim() || formSubjects[0] || 'Docente General',
        schoolGrade: formGrades.join(', '),
        assignedGrades: formGrades,
        assignedSections: formSections,
        assignedSubjects: formSubjects,
        phone: formPhone.trim() || undefined,
        avatar: defaultAvatar,
      });
    } else {
      await addUser({
        email: formEmail.trim().toLowerCase(),
        fullName: formFullName.trim(),
        role: formRole,
        specialty: formSpecialty.trim() || formSubjects[0] || 'Docente General',
        schoolGrade: formGrades.join(', '),
        assignedGrades: formGrades,
        assignedSections: formSections,
        assignedSubjects: formSubjects,
        phone: formPhone.trim() || undefined,
        avatar: defaultAvatar,
        status: 'active',
      });
    }

    setIsFormModalOpen(false);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    await updateUser({
      ...user,
      status: newStatus,
    });
  };

  const handleDelete = async (user: User) => {
    await deleteUser(user.id);
    setDeleteConfirmUser(null);
  };

  const handleSimulateLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'coordinator') {
      setViewMode('coordinator');
    } else {
      setViewMode('teacher');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.specialty && u.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-xs border border-indigo-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Autenticación de Google & Control de Acceso</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Gestión de Usuarios y Personal Docente
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Registra a los docentes y autoriza sus correos de Google. Solo las cuentas previamente creadas
              por la Coordinación podrán ingresar con Google a la plataforma.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Google Login test button */}
            <button
              onClick={isLoggedInWithGoogle ? logoutHandler : loginWithGoogleHandler}
              disabled={isAuthLoading}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
                isLoggedInWithGoogle
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30'
                  : 'bg-white hover:bg-slate-100 text-slate-800 shadow-white/10'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggedInWithGoogle ? 'Cerrar Sesión Google' : 'Iniciar con Google'}</span>
            </button>

            <button
              id="add-new-user-btn"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#5EA832] hover:bg-[#4d8c28] text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Docente / Usuario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Rule Card */}
      <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 flex items-start space-x-3 text-indigo-950">
        <KeyRound className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-extrabold text-indigo-900">
            Gestión del Usuario Maestro & Autenticación de Google:
          </p>
          <p className="text-indigo-800 leading-relaxed">
            El <strong>Usuario Maestro (Coordinación)</strong> tiene control total de los accesos. Desde este módulo registra los correos de Google del equipo docente y coordinadores. Al iniciar sesión fuera de la demo, Supabase consulta en tiempo real esta lista. Los docentes autorizados verán <strong>toda la data en tiempo real sincronizada</strong>, mientras que los correos no autorizados serán bloqueados de forma inmediata por seguridad.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="user-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o materia..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-400 font-bold hidden sm:inline">Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos los Roles</option>
              <option value="teacher">Solo Docentes</option>
              <option value="coordinator">Solo Coordinadores</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-400 font-bold hidden sm:inline">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isCurrent = currentUser.id === user.id;
          const isActive = user.status !== 'inactive';

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${
                isCurrent
                  ? 'border-indigo-400 ring-2 ring-indigo-500/20'
                  : isActive
                  ? 'border-slate-200'
                  : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              <div className="space-y-3">
                {/* User Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">
                          {user.fullName}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            user.role === 'coordinator'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-[#3A6B1F]'
                          }`}
                        >
                          {user.role === 'coordinator' ? 'Coordinación / Maestro' : 'Docente'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      title="Editar Perfil"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      title={isActive ? 'Desactivar acceso' : 'Activar acceso'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => setDeleteConfirmUser(user)}
                        title="Eliminar usuario"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Email Google Authorized */}
                <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate font-mono font-medium">{user.email}</span>
                </div>

                {/* Specialty & Assigned Subjects */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Especialidad / Asignaturas:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {user.assignedSubjects && user.assignedSubjects.length > 0 ? (
                      user.assignedSubjects.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-[#3A6B1F] border border-emerald-200/60"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {user.specialty || 'Docente de Grado'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned Grades & Sections */}
                {user.role === 'teacher' && (
                  <div className="space-y-1 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Grados & Secciones:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(user.assignedGrades || (user.schoolGrade ? [user.schoolGrade] : ['1er Grado'])).map(
                        (g) => (
                          <span
                            key={g}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                          >
                            {g}
                          </span>
                        )
                      )}
                      {user.assignedSections?.map((sec) => (
                        <span
                          key={sec}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700"
                        >
                          Sec. {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Quick simulate / test button */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Google Habilitado</span>
                </span>

                <button
                  onClick={() => handleSimulateLogin(user)}
                  disabled={isCurrent}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <LogIn className="w-3 h-3" />
                  <span>{isCurrent ? 'Sesión Actual' : 'Usar Perfil'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No se encontraron usuarios</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ningún usuario coincide con los términos de búsqueda o filtros aplicados.
          </p>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingUser ? 'Editar Perfil Docente' : 'Registrar Nuevo Docente / Usuario'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Autoriza el correo de Google para acceso a la plataforma
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Google Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico de Google *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="user-form-email"
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="docente@gmail.com o usuario@colegiomanglar.edu.ve"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Este es el correo exacto con el que el docente iniciará sesión vía Google.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  id="user-form-fullname"
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ej: Prof. Carmen Elena Silva"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rol Institucional *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormRole('teacher')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      formRole === 'teacher'
                        ? 'bg-emerald-50 border-emerald-300 text-[#3A6B1F] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Docente de Asignatura</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('coordinator')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      formRole === 'coordinator'
                        ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Coordinación Académica</span>
                  </button>
                </div>
              </div>

              {/* Assigned Dynamic Subjects */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Asignatura(s) Impartida(s)
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 grid grid-cols-2 gap-1.5 bg-slate-50/50">
                  {subjects.map((sub) => {
                    const isSelected = formSubjects.includes(sub.name);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleToggleSubject(sub.name)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-100 border-emerald-300 text-[#3A6B1F] font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#5EA832]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Grades */}
              {formRole === 'teacher' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Grados Asignados
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {displayGrades.map((grade) => {
                      const isChecked = formGrades.includes(grade);
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => handleToggleGrade(grade)}
                          className={`text-center py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isChecked
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assigned Sections */}
              {formRole === 'teacher' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Secciones Asignadas
                  </label>
                  <div className="flex space-x-3">
                    {['A', 'B'].map((sec) => {
                      const isChecked = formSections.includes(sec);
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleToggleSection(sec)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Sección {sec}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono / WhatsApp de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="user-form-phone"
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+58 414-1234567"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit and Cancel buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar y Autorizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                ¿Revocar Acceso al Usuario?
              </h3>
              <p className="text-xs text-slate-500">
                ¿Estás seguro de que deseas revocar el acceso a <strong>{deleteConfirmUser.fullName}</strong> ({deleteConfirmUser.email})? Ya no podrá ingresar con su cuenta de Google.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmUser)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Revocar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
