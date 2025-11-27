import { useState } from "react";
import { BLOCK_TYPES } from "@/components/builder/blockTypes";
import ControlToolkit from "@/components/builder/panels/ControlToolkit";
import PropertiesPanel from "@/components/builder/panels/PropertiesPanel";
import BuilderToolbar from "@/components/builder/BuilderToolbar";
import BuilderCanvas from "@/components/builder/BuilderCanvas";
import { setByPath } from "@/utils/objectUtils";
import { BuilderViewportProvider } from "@/context/BuilderViewportContext";

const getGroupControlIds = () => {
  const groupIds = new Set();
  BLOCK_TYPES.forEach((blockType) => {
    if (blockType.schema) {
      blockType.schema.forEach((group) => {
        if (group.isGroupElement && group.highlightControlId) {
          groupIds.add(group.highlightControlId);
        }
      });
    }
  });
  return Array.from(groupIds);
};

function BuilderContent({
  restaurantId,
  layout,
  setLayout,
  selectedBlockId,
  setSelectedBlockId,
  selectedSection,
  setSelectedSection,
  globalStyles,
  setGlobalStyles,
  activeControl,
  setActiveControl,
  headerConfig,
  setHeaderConfig,
  footerConfig,
  setFooterConfig,
  componentStyles,
  setComponentStyles,
  slug,
  setSlug,
  slugError,
  saving,
  handleSaveDraft,
  handlePublish,
  handleGenerateSlug,
  handleAddBlock,
  handleRemoveBlock,
  handleUpdateBlock,
  handleDragEnd,
  handleMoveBlockUp,
  handleMoveBlockDown,
  handleDuplicateBlock,
  handleQuickSwapVariant,
  handleUndo,
  handleRedo,
  canUndo,
  canRedo,
  sensors,
  selectedBlock,
}) {
  const [activeTab, setActiveTab] = useState("blocks");
  const [viewMode, setViewMode] = useState("desktop");
  const [useRealDataGlobal, setUseRealDataGlobal] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <BuilderToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        slug={slug}
        setSlug={setSlug}
        slugError={slugError}
        handleGenerateSlug={handleGenerateSlug}
        handleAddBlock={handleAddBlock}
        handleSaveDraft={handleSaveDraft}
        handlePublish={handlePublish}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        saving={saving}
        globalStyles={globalStyles}
        setGlobalStyles={setGlobalStyles}
        componentStyles={componentStyles}
        setActiveDrawer={setActiveDrawer}
      />

      <BuilderViewportProvider value={viewMode}>
        <BuilderCanvas
          restaurantId={restaurantId}
          layout={layout}
          selectedBlockId={selectedBlockId}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          setSelectedBlockId={setSelectedBlockId}
          activeControl={activeControl}
          setActiveControl={setActiveControl}
          headerConfig={headerConfig}
          footerConfig={footerConfig}
          componentStyles={componentStyles}
          globalStyles={globalStyles}
          slug={slug}
          viewMode={viewMode}
          setViewMode={setViewMode}
          useRealDataGlobal={useRealDataGlobal}
          setUseRealDataGlobal={setUseRealDataGlobal}
          setLayout={setLayout}
          handleDragEnd={handleDragEnd}
          handleAddBlock={handleAddBlock}
          handleRemoveBlock={handleRemoveBlock}
          handleMoveBlockUp={handleMoveBlockUp}
          handleMoveBlockDown={handleMoveBlockDown}
          handleDuplicateBlock={handleDuplicateBlock}
          handleQuickSwapVariant={handleQuickSwapVariant}
          sensors={sensors}
          activeDrawer={activeDrawer}
        />
      </BuilderViewportProvider>

      <div className="w-80 bg-white border-l shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b flex-shrink-0 bg-white">
          <h4 className="text-sm font-semibold">
            {activeControl ? "Element Settings" : "Block Settings"}
          </h4>
        </div>

        <div className="flex-1 p-2 overflow-y-auto min-h-0">
          {activeControl &&
            (() => {
              const cid = activeControl.controlId || "";
              const groupControls = getGroupControlIds();
              const isGroup = groupControls.includes(cid);
              return !isGroup;
            })() ? (
            <ControlToolkit
              activeControl={activeControl}
              block={
                layout.find((b) => b.id === activeControl.blockId) ??
                (selectedSection === "header"
                  ? { id: "HEADER", props: headerConfig, type: "HEADER" }
                  : selectedSection === "footer"
                    ? { id: "FOOTER", props: footerConfig, type: "FOOTER" }
                    : null)
              }
              globalStyles={globalStyles}
              onControlChange={(path, val) => {
                if (
                  activeControl.blockId === "HEADER" ||
                  activeControl.blockId?.toUpperCase() === "HEADER"
                ) {
                  setHeaderConfig(setByPath(headerConfig, path, val));
                } else if (
                  activeControl.blockId === "FOOTER" ||
                  activeControl.blockId?.toUpperCase() === "FOOTER"
                ) {
                  setFooterConfig(setByPath(footerConfig, path, val));
                } else if (activeControl.blockId) {
                  const block = layout.find(
                    (b) => b.id === activeControl.blockId
                  );
                  if (!block) return;
                  const updatedProps = setByPath(block.props, path, val);
                  handleUpdateBlock({ ...block, props: updatedProps });
                }
              }}
            />
          ) : (
            <PropertiesPanel
              selectedBlock={selectedBlock}
              onChange={handleUpdateBlock}
              headerConfig={headerConfig}
              onHeaderChange={setHeaderConfig}
              footerConfig={footerConfig}
              onFooterChange={setFooterConfig}
              selectedSection={selectedSection}
              activeControl={activeControl}
              globalStyles={globalStyles}
              setActiveControl={setActiveControl}
              globalUseRealData={useRealDataGlobal}
              previewMode={viewMode}
            />
          )}
          <div className="h-10"></div>
        </div>
      </div>

      {activeDrawer && (
        <ComponentDrawer
          type={activeDrawer}
          currentStyle={componentStyles[activeDrawer]}
          onStyleChange={setComponentStyles}
          onClose={() => setActiveDrawer(null)}
        />
      )}
    </div>
  );
}


export default BuilderContent;
