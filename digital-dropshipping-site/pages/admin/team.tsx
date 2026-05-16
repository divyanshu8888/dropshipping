import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Plus, Mail, Users, UserCheck, UserX, ShieldCheck, Clock, MapPin, Phone } from 'lucide-react'
import dynamic from 'next/dynamic'
const Header = dynamic(() => import('../../src/components/Header'))
import { useAuth } from '../../src/contexts/AuthContext'

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  skills?: string;
  location?: string;
  phone?: string;
}

interface AdminProps {
  user: any;
}

export default function TeamManagement(_props: AdminProps) {
  const router = useRouter()
  const auth = useAuth()
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [loadingAction, setLoadingAction] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TEAM_MEMBER',
    skills: '',
    location: '',
    phone: ''
  })

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'TEAM_MEMBER',
    message: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!auth) return
    if (auth.loading) return

    const role = String(auth.user?.role || '').toUpperCase()
    if (!auth.user || (role !== 'ADMIN' && role !== 'TEAM_MEMBER')) {
      router.replace('/login')
      return
    }

    setLoading(false)
    fetchTeamMembers()
  }, [auth?.loading, auth?.user, router])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/admin/team-members')
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data.teamMembers)
      } else {
        console.error('Failed to fetch team members')
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoadingAction(true)

    try {
      const response = await fetch('/api/admin/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowAddModal(false)
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'TEAM_MEMBER',
          skills: '',
          location: '',
          phone: ''
        })
        fetchTeamMembers()
      } else {
        setErrors({ submit: data.error || 'Failed to create team member' })
      }
    } catch (error) {
      setErrors({ submit: 'Error creating team member' })
    } finally {
      setLoadingAction(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoadingAction(true)

    try {
      const response = await fetch('/api/admin/team-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember?.id,
          ...formData,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowEditModal(false)
        setSelectedMember(null)
        fetchTeamMembers()
      } else {
        setErrors({ submit: data.error || 'Failed to update team member' })
      }
    } catch (error) {
      setErrors({ submit: 'Error updating team member' })
    } finally {
      setLoadingAction(false)
    }
  }

  const [_memberPendingDelete, setMemberPendingDelete] = useState<TeamMember | null>(null)

  const openDeleteModal = (member: TeamMember) => {
    setMemberPendingDelete(member)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoadingAction(true)

    try {
      const response = await fetch('/api/admin/invite-team-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData)
      })

      const data = await response.json()

      if (response.ok) {
        setShowInviteModal(false)
        setInviteData({
          email: '',
          role: 'TEAM_MEMBER',
          message: ''
        })
        alert('Invitation sent successfully!')
      } else {
        setErrors({ submit: data.error || 'Failed to send invitation' })
      }
    } catch (error) {
      setErrors({ submit: 'Error sending invitation' })
    } finally {
      setLoadingAction(false)
    }
  }

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role,
      skills: member.skills ? JSON.parse(member.skills).join(', ') : '',
      location: member.location || '',
      phone: member.phone || ''
    })
    setShowEditModal(true)
  }

  const roleMeta: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
    ADMIN: { label: 'Admin', classes: 'bg-purple-500/15 text-purple-200 border border-purple-400/30', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    TEAM_MEMBER: { label: 'Team Member', classes: 'bg-blue-500/15 text-blue-200 border border-blue-400/30', icon: <Users className="h-3.5 w-3.5" /> }
  }

  const statusMeta = (isActive: boolean) =>
    isActive
      ? { label: 'Active', classes: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30' }
      : { label: 'Inactive', classes: 'bg-rose-500/15 text-rose-200 border border-rose-400/30' }

  const formatDate = (value?: string) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Team Management - Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-superhuman text-text-base">
        <Header />

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_150%_at_50%_-20%,rgba(99,102,241,0.35)_0%,rgba(24,24,27,0.95)_55%,rgba(15,15,20,1)_100%)] pt-28 pb-16 text-white">
          <div className="absolute inset-x-0 -bottom-16 h-32 bg-gradient-to-b from-transparent to-black/80" />
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                <Users className="h-3.5 w-3.5" />
                Uniti Team Command
              </span>
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                Orchestrate the <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">Uniti squad</span>
              </h1>
              <p className="max-w-xl text-sm text-white/70">
                Invite operators, assign permissions, and keep the marketplace support force humming. Every teammate you add gets instant routing into the admin experience.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Role-based access
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Clock className="h-3.5 w-3.5" />
                  Last seen tracking
                </span>
              </div>
            </div>
            <div className="relative z-10 flex flex-col gap-3 text-sm">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                ← Back to Command Center
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50"
                >
                  <Mail className="h-4 w-4" />
                  Send Invite
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-300/80 hover:bg-white/20"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Roster</p>
                  <h2 className="text-lg font-semibold text-white">Teammates ({teamMembers.length})</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    <UserCheck className="h-3 w-3 text-emerald-300" />
                    {teamMembers.filter((m) => m.isActive).length} active
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    <UserX className="h-3 w-3 text-rose-300" />
                    {teamMembers.filter((m) => !m.isActive).length} inactive
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5 text-sm text-white/70">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.15em] text-white/50">
                    <tr>
                      <th className="px-6 py-3 text-left">Member</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Last Login</th>
                      <th className="px-6 py-3 text-left">Joined</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {teamMembers.map((member) => {
                      const role = roleMeta[member.role] ?? roleMeta.TEAM_MEMBER
                      const status = statusMeta(member.isActive)

                      return (
                        <tr key={member.id} className="transition hover:bg-white/[0.03]">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-inner shadow-black/30 ${
                                  member.role === 'ADMIN'
                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                    : 'bg-gradient-to-br from-blue-500 to-sky-500'
                                }`}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white/90">{member.name}</p>
                                <p className="text-xs text-white/50">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${role.classes}`}
                            >
                              {role.icon}
                              {role.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${status.classes}`}
                            >
                              <span className={`h-2 w-2 rounded-full ${member.isActive ? 'bg-emerald-300' : 'bg-rose-300'}`} />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white/70">{formatDate(member.lastLoginAt)}</td>
                          <td className="px-6 py-4 text-white/70">{formatDate(member.createdAt)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 text-xs font-semibold">
                              <button
                                onClick={() => openEditModal(member)}
                                className="rounded-full border border-white/10 px-3 py-1 text-white/80 transition hover:border-indigo-300/70 hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(member)}
                                className="rounded-full border border-red-400/40 px-3 py-1 text-red-200 transition hover:border-red-400/80 hover:bg-red-500/10"
                                disabled={loadingAction}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Guides</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    Use Admin role for full access; Team Member for operational tooling only.
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-purple-300" />
                    Invite sends an email with a setup link and temporary credentials.
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Status flips automatically after a successful login.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Playbook</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-center justify-between">
                    <span>Ops Sprints</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Weekly</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Onboarding time</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">~8 mins</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Escalation lead</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Auto-assigned</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>

        {/* Add Team Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-8 py-6 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">Create teammate</p>
                  <h2 className="text-2xl font-semibold">Add to Uniti Command</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-white/10 p-2 text-white/60 transition hover:border-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6 px-8 py-6 text-white/80">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      required
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-white/40">Minimum 8 characters</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    >
                      <option className="bg-black text-white" value="TEAM_MEMBER">
                        Team Member
                      </option>
                      <option className="bg-black text-white" value="ADMIN">
                        Admin
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                      Skills
                    </label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="Design, Escalations, Supplier ops"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                      Location
                    </label>
                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/30" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                        placeholder="Sydney, AUS"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                      Phone
                    </label>
                    <div className="relative mt-2">
                      <Phone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/30" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                        placeholder="+61 415 000 000"
                      />
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {errors.submit}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-50"
                  >
                    {loadingAction ? 'Creating…' : 'Create Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Team Member Modal */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Edit Team Member</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">New Password (leave blank to keep current)</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="TEAM_MEMBER">Team Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Design, Development, Marketing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., New York, NY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                      {errors.submit}
                    </div>
                  )}

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold disabled:opacity-50"
                    >
                      {loadingAction ? 'Updating...' : 'Update Team Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Invite Team Member Modal */}
        {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-8 py-6 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Invite teammate</p>
                <h2 className="text-2xl font-semibold">Send Team Invitation</h2>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="rounded-full border border-white/10 p-2 text-white/60 transition hover:border-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-6 px-8 py-6 text-white/80">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    placeholder="team.member@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                    Role
                  </label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  >
                    <option className="bg-black text-white" value="TEAM_MEMBER">Team Member</option>
                    <option className="bg-black text-white" value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteData.message}
                    onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    rows={4}
                    placeholder="Welcome to our team! We're excited to have you join us..."
                  />
                </div>
              </div>

              {errors.submit && (
                <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errors.submit}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-50"
                >
                  {loadingAction ? 'Sending…' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (_context) => {
  // For client-side authentication, we'll handle auth in the component
  // This prevents server-side redirect issues
  return {
    props: {
      user: null, // Will be loaded client-side
    },
  };
};
