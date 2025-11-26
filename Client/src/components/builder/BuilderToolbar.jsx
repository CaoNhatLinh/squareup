import { BLOCK_TYPES } from '@/components/builder/blockTypes';
import { ICON_MAP } from '@/components/builder/config/icons';
import GlobalStylesPanel from '@/components/builder/panels/GlobalStylesPanel';
import {
  HiArrowNarrowLeft,
  HiArrowNarrowRight,
} from 'react-icons/hi';
import {
  HiSquaresPlus,
  HiPaintBrush,
  HiBolt,
} from 'react-icons/hi2';

const BuilderToolbar = ({
  activeTab,
  setActiveTab,
  slug,
  setSlug,
  slugError,
  handleGenerateSlug,
  handleAddBlock,
  handleSaveDraft,
  handlePublish,
  handleUndo,
  handleRedo,
  canUndo,
  canRedo,
  saving,
  globalStyles,
  setGlobalStyles,
}) => {
  return (
    <div className="w-80 bg-white border-r flex flex-col z-20 shadow-sm transition-all duration-200 relative h-full">
      <div className="flex border-b flex-shrink-0 bg-white">
        <button
          onClick={() => setActiveTab("blocks")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "blocks"
              ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <HiSquaresPlus className="w-5 h-5" />
          Blocks
        </button>
        <button
          onClick={() => setActiveTab("styles")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "styles"
              ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <HiPaintBrush className="w-5 h-5" />
          Styles
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {activeTab === "blocks" ? (
          <>
            <h2 className="text-xl font-bold mb-4">Website Builder</h2>
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">
                Site Settings
              </h3>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Custom Slug
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="my-restaurant"
                    className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                      slugError ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    onClick={handleGenerateSlug}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                    title="Generate from restaurant name"
                  >
                    <HiBolt className="w-4 h-4" />
                  </button>
                </div>
                {slugError && (
                  <p className="text-red-500 text-xs mt-1">{slugError}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">
                Add Blocks
              </h3>
              <div className="space-y-2">
                {BLOCK_TYPES.filter(
                  (b) => !["HEADER", "FOOTER"].includes(b.type)
                ).map((blockType) => (
                  <button
                    key={blockType.type}
                    onClick={() => handleAddBlock(blockType)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition border border-gray-200 hover:border-orange-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-gray-500 group-hover:text-orange-500 transition-colors">
                        {(() => {
                          if (!blockType?.icon) return "📦";
                          const Icon = ICON_MAP[blockType.icon] || null;
                          return Icon ? (
                            <Icon className="w-6 h-6" />
                          ) : (
                            blockType.icon
                          );
                        })()}
                      </span>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {blockType.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {blockType.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <GlobalStylesPanel
            globalStyles={globalStyles}
            onChange={setGlobalStyles}
          />
        ) }
      </div>

      <div className="p-4 mt-auto border-t space-y-2 bg-gray-50 flex-shrink-0">
        <div className="flex gap-2 mb-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex-1 px-3 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <HiArrowNarrowLeft className="w-4 h-4" /> <span>Undo</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex-1 px-3 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <span>Redo</span> <HiArrowNarrowRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 font-semibold text-sm"
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={handlePublish}
          disabled={saving}
          className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold shadow-md"
        >
          {saving ? "Publishing..." : "Publish Live"}
        </button>
      </div>
    </div>
  );
};


export default BuilderToolbar;