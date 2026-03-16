'use client';

import { KnowledgeDocumentList } from './KnowledgeDocumentList';
import { KnowledgeUploadCard } from './KnowledgeUploadCard';
import { useKnowledgeDocuments } from '../hooks/use-knowledge-documents';

export function KnowledgePageView() {
  const {
    documents,
    loading,
    uploading,
    dragOver,
    error,
    deleteConfirm,
    setDragOver,
    setDeleteConfirm,
    clearError,
    handleDrop,
    handleFileInput,
    handleDelete,
  } = useKnowledgeDocuments();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            📚 知识库
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            上传学习材料，在工作流中使用知识库节点检索相关内容
          </p>
        </div>
        <div className="text-sm text-muted-foreground">{documents.length} 个文档</div>
      </div>

      <KnowledgeUploadCard
        dragOver={dragOver}
        uploading={uploading}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onFileInput={handleFileInput}
      />

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <span>❌</span>
          {error}
          <button
            onClick={clearError}
            className="ml-auto text-destructive/60 hover:text-destructive"
          >
            ✕
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">加载中...</div>
      ) : (
        <KnowledgeDocumentList
          documents={documents}
          deleteConfirm={deleteConfirm}
          onDeleteConfirmChange={setDeleteConfirm}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
