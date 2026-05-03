'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, AlignLeft, AlertCircle, Image as ImageIcon, X, Upload, ChevronDown, PlusCircle, Wrench, CheckCircle, Search, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-400' },
  { value: 'medium', label: 'Medium', color: 'text-orange-400' },
  { value: 'high', label: 'High', color: 'text-red-400' },
]

type Technician = {
  id: string
  name: string
  specialty: string
  available: boolean
  avatar_url: string | null
}

const AVATAR_COLORS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function CreateTicketPage() {
  const { user } = useUser()
  const { isOpen } = useSidebar()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null)
  const [techSearch, setTechSearch] = useState('')
  const [techLoading, setTechLoading] = useState(true)
  const [techDropdownOpen, setTechDropdownOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchTechnicians = async () => {
      setTechLoading(true)
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('name')
      if (error) {
        console.error('Failed to fetch technicians:', error)
      } else {
        setTechnicians(data || [])
      }
      setTechLoading(false)
    }
    fetchTechnicians()
  }, [user])

  const filteredTechnicians = technicians.filter((t) =>
    t.name.toLowerCase().includes(techSearch.toLowerCase()) ||
    t.specialty.toLowerCase().includes(techSearch.toLowerCase())
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const validate = () => {
    const e: typeof errors = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!description.trim()) e.description = 'Description is required'
    else if (description.length < 10) e.description = 'Please describe the issue in more detail'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    if (!validate()) return

    setLoading(true)
    let imageUrl: string | null = null

    // Upload image if selected
    if (image) {
      const ext = image.name.split('.').pop()
      const filename = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filename, image)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        toast.error(`Image upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(filename)
      imageUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('tickets').insert({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'pending',
      user_id: user.id,
      image_url: imageUrl,
      technician_id: selectedTechnicianId,
    })

    setLoading(false)

    if (error) {
      console.error('Ticket insert error:', error)
      toast.error(`Failed to create ticket: ${error.message}`)
    } else {
      toast.success('Ticket submitted!')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar title="New Ticket" />

      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        isOpen ? "md:ml-72" : "md:ml-20"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">

          {/* Page Heading */}
          <div className="mb-8 hidden md:block">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">User Portal / Support</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Initialize New Ticket</h1>
            <p className="text-sm text-slate-500 mt-1">Provide technical details to expedite the resolution process.</p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start gap-10">

            {/* Form Section */}
            <div className="w-full lg:max-w-xl">
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                {/* Title */}
                <Input
                  id="title"
                  label="Subject Summary"
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={errors.title}
                />

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Diagnostic Details</label>
                  <textarea
                    placeholder="Include error codes, steps to reproduce, and any recent system changes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className={cn(
                      'w-full rounded-lg px-4 py-3 text-slate-100 text-sm placeholder:text-slate-600',
                      'transition-all duration-200 outline-none resize-none',
                      '[background-color:#111118] [border:1px_solid_#2a2a38] focus:[border-color:#3b82f6]',
                      errors.description ? '[border-color:#7f1d1d]' : ''
                    )}
                  />
                  {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                </div>

                {/* Priority Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'Critical'}].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value as typeof priority)}
                        className={cn(
                          'py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200',
                          '[border:1px_solid_#2a2a38]',
                          priority === p.value
                            ? '[background-color:#1d2d4a] [border-color:#3b82f6] text-blue-400'
                            : '[background-color:#111118] text-slate-600 hover:text-slate-300'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technician Selection — collapsible dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Assign Technician <span className="text-slate-600 normal-case tracking-normal font-normal">(Optional)</span></label>

                  {/* Dropdown trigger */}
                  <button
                    type="button"
                    onClick={() => setTechDropdownOpen(prev => !prev)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200',
                      '[background-color:#111118] [border:1px_solid_#2a2a38] hover:[border-color:#3a3a4e]',
                      techDropdownOpen ? '[border-color:#3b82f6]' : ''
                    )}
                  >
                    <span className={selectedTechnicianId
                      ? 'text-slate-100 font-semibold'
                      : 'text-slate-600'
                    }>
                      {selectedTechnicianId
                        ? technicians.find(t => t.id === selectedTechnicianId)?.name || 'Selected'
                        : 'Select an infrastructure area'}
                    </span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-600 transition-transform', techDropdownOpen && 'rotate-180')} />
                  </button>

                  {/* Dropdown panel */}
                  {techDropdownOpen && (
                    <div className="rounded-lg overflow-hidden [background-color:#111118] [border:1px_solid_#2a2a38]">
                      {/* Search inside dropdown */}
                      <div className="p-2 [border-bottom:1px_solid_#2a2a38]">
                        <input
                          type="text"
                          placeholder="Search by name or specialty..."
                          value={techSearch}
                          onChange={(e) => setTechSearch(e.target.value)}
                          className="w-full px-3 py-2 rounded text-sm text-slate-100 placeholder:text-slate-600 outline-none [background-color:#16161e] [border:1px_solid_#2a2a38] focus:[border-color:#3b82f6]"
                        />
                      </div>

                      {/* List */}
                      <div className="max-h-52 overflow-y-auto scrollbar-none">
                        {/* None option */}
                        <button
                          type="button"
                          onClick={() => { setSelectedTechnicianId(null); setTechDropdownOpen(false) }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                            !selectedTechnicianId ? 'text-blue-400' : 'text-slate-500 hover:text-slate-200 hover:[background-color:#16161e]'
                          )}
                        >
                          <span className="w-2 h-2 rounded-full border border-slate-700 flex-shrink-0" />
                          Unassigned (Auto-route)
                        </button>

                        {techLoading ? (
                          <div className="px-4 py-3 text-xs text-slate-600">Loading...</div>
                        ) : filteredTechnicians.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-slate-600">No technicians found</div>
                        ) : (
                          filteredTechnicians.map((tech) => {
                            const isSelected = selectedTechnicianId === tech.id
                            return (
                              <button
                                key={tech.id}
                                type="button"
                                onClick={() => { setSelectedTechnicianId(isSelected ? null : tech.id); setTechDropdownOpen(false) }}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                  isSelected
                                    ? '[background-color:#1d2d4a] text-blue-400'
                                    : 'text-slate-300 hover:[background-color:#16161e]'
                                )}
                              >
                                <span className={cn(
                                  'w-2 h-2 rounded-full flex-shrink-0',
                                  tech.available ? 'bg-emerald-500' : 'bg-red-500'
                                )} />
                                <span className="flex-1 font-medium">{tech.name}</span>
                                <span className="text-xs text-slate-600">{tech.specialty}</span>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTechnicianId && (
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest">
                      Technician assigned — will be notified on submit
                    </p>
                  )}
                </div>

                {/* Image Upload Area */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Attachment <span className="text-slate-500 font-normal ml-1">(Optional)</span>
                  </label>

                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden [border:1px_solid_#2a2a38] [background-color:#111118] group">
                      <img src={imagePreview} alt="preview" className="w-full h-48 object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        'flex flex-col items-center justify-center gap-3 py-10 rounded-lg cursor-pointer transition-all duration-200',
                        '[background-color:#111118]',
                        isDragging
                          ? '[border:2px_dashed_#3b82f6] [background-color:#111827]'
                          : '[border:2px_dashed_#2a2a38] hover:[border-color:#3b82f6] hover:[background-color:#111827]'
                      )}
                    >
                      <Upload className={cn('w-7 h-7 transition-colors', isDragging ? 'text-blue-400' : 'text-slate-600')} />
                      <div className="text-center">
                        <p className={cn('text-sm font-semibold transition-colors', isDragging ? 'text-blue-400' : 'text-slate-300')}>
                          {isDragging ? 'Drop to attach' : 'Drag & drop your files here'}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">or click to browse for a Capture d'écran</p>
                        <p className="text-[10px] text-slate-700 mt-1 uppercase tracking-widest">JPG, PNG, PDF up to 10MB</p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <Button type="submit" fullWidth loading={loading} size="lg" className="mt-4">
                  Submit Ticket
                </Button>
              </form>
            </div>

            {/* Guidelines / Tips Aside */}
            <aside className="hidden lg:block flex-1 min-w-[320px]">
              <Card className="space-y-6 p-8 shadow-xl shadow-blue-900/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Submission Tips</h2>
                </div>
                
                {[
                  { icon: '📝', title: 'Be descriptive', body: 'Explain exactly what happened, including any specific error codes you encountered.' },
                  { icon: '📸', title: 'Visual evidence', body: 'A screenshot helps our team identify UI bugs or system errors significantly faster.' },
                  { icon: '⚡', title: 'Priority impact', body: 'Reserved high priority for issues that completely block your ability to work.' },
                  { icon: '🕐', title: 'Response targets', body: 'We aim to review high priority tickets within 2 business hours of submission.' },
                ].map((tip) => (
                  <div key={tip.title} className="flex gap-4 group">
                    <span className="text-2xl flex-shrink-0 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{tip.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5 tracking-tight">{tip.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{tip.body}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700/50">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest">Support Hours</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Mon - Fri, 9:00 AM - 6:00 PM</p>
                </div>
              </Card>
            </aside>

          </div>
        </div>
      </main>


    </div>
  )
}
