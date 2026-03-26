'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import NoticeEditor, { type NoticeFormData, type NoticeType, type NoticeStatus } from '@/features/admin/notices/NoticeEditor'
import { adminFetch } from '@/services/admin.service'

interface NoticeDetail {
  id: string
  title: string
  content: string
  type: string
  status: string
  expires_at: string | null
  created_at: string
  published_at: string | null
  read_count: number
}

export default function EditNoticePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const noticeId = params.id

  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!noticeId) return
    adminFetch<NoticeDetail>(`/notices/${noticeId}`)
      .then(setNotice)
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : '加载公告失败')
      })
  }, [noticeId])

  const handleSubmit = async (data: NoticeFormData) => {
    if (!noticeId) return
    setIsLoading(true)
    setSaveError(null)
    try {
      await adminFetch(`/notices/${noticeId}`, {
        method: 'PUT',
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
      setSaveError(err instanceof Error ? err.message : '保存公告失败')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading skeleton
  if (!notice && !loadError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 bg-[#f4f4f0]">
        <div className="h-8 w-48 bg-[#e1ded1] animate-pulse" />
        <div className="bg-[#f4f4f0] border border-[#c4c6cf] rounded-none p-6 space-y-4 shadow-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#e1ded1] animate-pulse" />
          ))}
          <div className="h-40 bg-[#e1ded1] animate-pulse" />
        </div>
      </div>
    )
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
          <h1 className="text-[#002045] text-xl font-bold">编辑公告</h1>
          {notice && (
            <p className="text-[#74777f] text-sm mt-0.5">
              已读 {notice.read_count.toLocaleString('zh-CN')} 次
            </p>
          )}
        </div>
      </div>

      {/* Load error */}
      {loadError && (
        <div className="rounded-none px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm">
          {loadError}
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <div className="rounded-none px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm">
          {saveError}
        </div>
      )}

      {/* Editor card */}
      {notice && (
        <div className="bg-[#f4f4f0] border border-[#c4c6cf] rounded-none p-6 shadow-sm">
          <NoticeEditor
            initialData={{
              title: notice.title,
              content: notice.content,
              type: notice.type as NoticeType,
              status: notice.status as NoticeStatus,
              expires_at: notice.expires_at
                ? new Date(notice.expires_at).toISOString().slice(0, 16)
                : '',
            }}
            onSubmit={handleSubmit}
            submitLabel="保存修改"
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}
