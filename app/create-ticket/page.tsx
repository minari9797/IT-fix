'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, AlignLeft, AlertCircle, Image as ImageIcon, X, Upload, ChevronDown, PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks'
import { useSidebar } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
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
      technician_id: null,
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
        isOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <div className="px-4 pt-4 md:px-10 md:pt-8 max-w-7xl">

          {/* Page Heading */}
          <div className="mb-8 hidden md:block">
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Create Ticket</h1>
            <p className="text-sm text-slate-400 mt-1.5 font-medium">Describe your IT issue and we'll get it sorted</p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start gap-10">

            {/* Form Section */}
            <div className="w-full lg:max-w-xl">
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                {/* Title */}
                <Input
                  id="title"
                  label="Issue Title"
                  placeholder="e.g. Laptop won't connect to Wi-Fi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={errors.title}
                  icon={<FileText className="w-4 h-4" />}
                />

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">Description</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3.5 top-4 w-4 h-4 text-slate-500" />
                    <textarea
                      placeholder="Describe the issue in detail — what happened, when it started, what you've tried..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className={cn(
                        "w-full rounded-lg border bg-slate-800 pl-11 pr-4 py-3.5 text-slate-100 text-sm placeholder:text-slate-500",
                        "transition-all duration-200 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                        errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-700'
                      )}
                    />
                  </div>
                  {errors.description && <p className="text-xs font-medium text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.description}
                  </p>}
                </div>

                {/* Priority Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value as typeof priority)}
                        className={cn(
                          "py-3 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all duration-200",
                          priority === p.value
                            ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm"
                            : "border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600 hover:bg-slate-750"
                        )}
                      >
                        <span className={priority === p.value ? 'text-blue-400' : p.color}>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload Area */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Attachment <span className="text-slate-500 font-normal ml-1">(Optional)</span>
                  </label>

                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
                      <img src={imagePreview} alt="preview" className="w-full h-56 object-contain p-2" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 shadow-xl transition-all scale-90 group-hover:scale-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 py-10 rounded-lg border-2 border-dashed border-slate-700",
                        "bg-slate-800/50 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 cursor-pointer"
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md">
                        <Upload className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-sm font-semibold text-slate-200">Upload Ticket Attachment</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Click to select PNG, JPG or GIF (max 5MB)</p>
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

                <Button type="submit" fullWidth loading={loading} size="lg" className="mt-4 shadow-xl shadow-blue-900/40">
                  <PlusCircle className="w-4 h-4 mr-1" /> Create Support Ticket
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
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Submission Tips</h2>
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
                      <p className="text-sm font-bold text-slate-200 mb-0.5 tracking-tight">{tip.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{tip.body}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 mt-2 border-t border-slate-700/50">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Support Hours</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Mon - Fri, 9:00 AM - 6:00 PM</p>
                </div>
              </Card>
            </aside>

          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
