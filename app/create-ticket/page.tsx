'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, AlignLeft, AlertCircle, Image as ImageIcon, X, Upload, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import Topbar from '@/components/layout/Topbar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-orange-500' },
  { value: 'high', label: 'High', color: 'text-red-500' },
]

export default function CreateTicketPage() {
  const { user } = useUser()
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
        toast.error('Image upload failed')
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
      toast.error('Failed to create ticket')
    } else {
      toast.success('Ticket submitted!')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar title="New Ticket" />

      <main className="md:ml-60 pb-28 md:pb-8">
        <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-xl">
          <div className="mb-6 hidden md:block">
            <h2 className="text-xl font-bold text-gray-900">Create Ticket</h2>
            <p className="text-sm text-gray-400 mt-0.5">Describe your IT issue and we'll get it sorted</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <textarea
                  placeholder="Describe the issue in detail — what happened, when it started, what you've tried..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className={`w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 transition-all duration-200 outline-none resize-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value as typeof priority)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                      ${priority === p.value
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <span className={priority === p.value ? '' : p.color}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Screenshot <span className="text-gray-400 font-normal">(optional)</span>
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/60 text-white flex items-center justify-center hover:bg-gray-900/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Upload screenshot</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG or GIF up to 5MB</p>
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

            <Button type="submit" fullWidth loading={loading} size="lg">
              Submit Ticket
            </Button>
          </form>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
