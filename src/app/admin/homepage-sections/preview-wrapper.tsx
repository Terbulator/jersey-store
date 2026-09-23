'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { HomepageSectionsManager } from './homepage-sections-manager';
import { PreviewPanel } from './preview-panel';

export function PreviewWrapper({ items, settingsMap, products, categories, editions, reviews }: {
  items: { id: string; key: string; name: string; enabled: boolean; sort_order: number }[];
  settingsMap: Record<string, Record<string, unknown> | null>;
  products: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  editions: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editorSettings, setEditorSettings] = useState<Record<string, Record<string, unknown> | null>>({});
  const [inspectorMode, setInspectorMode] = useState(false);

  function updateEditor(key: string, settings: Record<string, unknown> | null) {
    setEditorSettings((prev) => ({ ...prev, [key]: settings }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#EFECE6]">Homepage Sections</h1>
          <p className="mt-0.5 text-[12px] text-[#A8A8A8]">
            Toggle, reorder, and edit what renders on the storefront homepage.
            {previewOpen && <span className="text-[#B3001B] ml-2">● Preview active</span>}
          </p>
        </div>
        <button onClick={() => { setPreviewOpen(!previewOpen); setInspectorMode(false); }} className="flex items-center gap-2 rounded-md border border-[#292929] px-3 py-1.5 text-[12px] text-[#EFECE6] hover:border-[#B3001B] transition-colors">
          {previewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {previewOpen ? 'Close Preview' : 'Live Preview'}
        </button>
      </div>

      {inspectorMode && (
        <button onClick={() => setInspectorMode(false)} className="text-[11px] text-[#B3001B] hover:underline">Exit inspector mode</button>
      )}

      <div className={previewOpen ? 'grid grid-cols-1 lg:grid-cols-5 gap-5' : ''}>
        <div className={previewOpen ? 'lg:col-span-2' : ''}>
          <HomepageSectionsManager
            items={items}
            settingsMap={settingsMap}
            onSettingsChange={updateEditor}
            inspectorMode={inspectorMode && !selectedKey}
            onSelectSection={(key) => { setSelectedKey(key); setInspectorMode(false); }}
          />
        </div>
        {previewOpen && (
          <div className="lg:col-span-3">
            <div className="mb-2 flex items-center gap-2">
              {inspectorMode ? (
                <span className="text-[11px] text-[#B3001B]">Inspector: hover sections to select</span>
              ) : (
                <button onClick={() => setInspectorMode(true)} className="text-[11px] text-[#A8A8A8] hover:text-[#EFECE6] underline">
                  Preview / Select mode — hover sections
                </button>
              )}
            </div>
            <div className="rounded-md border border-[#292929] bg-[#0a0a0a] overflow-hidden">
              <PreviewPanel
                settingsMap={settingsMap}
                products={products}
                categories={categories}
                editions={editions}
                reviews={reviews}
                selectedKey={selectedKey}
                editorSettings={editorSettings}
                onSelect={(key) => { setSelectedKey(key); setInspectorMode(false); }}
                inspectorMode={inspectorMode}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
