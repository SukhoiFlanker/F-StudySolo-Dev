'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NoticeEditor, { type NoticeFormData } from '@/features/admin/notices/NoticeEditor'
import { adminFetch } from '@/services/admin.service'

export default function CreateNoticePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: NoticeFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await adminFetch('/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          type: data.type,
          status: data.status,
          expires_at: data.expires_at || null,
        }),
      })
      router.push('/admin-analysis/notices')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建公告失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#f4f4f0]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-[#74777f] hover:text-[#002045] transition-colors"
          aria-label="返回"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-[#002045] text-xl font-bold">新建公告</h1>
          <p className="text-[#74777f] text-sm mt-0.5">创建面向用户展示的新公告</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-none px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Editor card */}
      <div className="bg-[#f4f4f0] border border-[#c4c6cf] rounded-none p-6 shadow-sm">
        <NoticeEditor
          onSubmit={handleSubmit}
          submitLabel="创建公告"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
