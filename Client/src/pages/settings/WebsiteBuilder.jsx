import { useCallback, useEffect, useState } from "react";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { ref, get, update } from "firebase/database";
import { rtdb } from "@/firebase";
import {
  updateRestaurantSiteConfig,
  generateSlug,
  isSlugAvailable,
}  from '@/api/siteConfig';
import { DEFAULT_SITE_CONFIG } from '@/utils/siteConfigUtils';
import { BLOCK_TYPES } from "@/components/builder/blockTypes";
import { ShopProvider } from "@/context/ShopProvider";
import useAppStore from "@/store/useAppStore";
import { useToast } from "@/hooks/useToast";
import BuilderContent from "@/components/builder/BuilderContent";

import { deepMerge } from "@/utils/objectUtils";
import { DEFAULT_GLOBAL_STYLES } from "@/components/builder/config/defaults";

import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";


export default function WebsiteBuilder() {
  const restaurantId = useAppStore((s) => s.restaurantId);
  const { success :showSuccess, error :showError ,warning :showWarning } = useToast();
  const [layout, setLayout] = useState([]);
  const [headerConfig, setHeaderConfig] = useState(
    BLOCK_TYPES.find((t) => t.type === "HEADER").defaultProps
  );
  const [footerConfig, setFooterConfig] = useState(
    BLOCK_TYPES.find((t) => t.type === "FOOTER").defaultProps
  );
  const [globalStyles, setGlobalStyles] = useState(DEFAULT_GLOBAL_STYLES);
 

  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeControl, setActiveControl] = useState(null);

  const [slug, setSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function loadSiteConfig() {
      if (!restaurantId) return;

      try {
        const restaurantRef = ref(rtdb, `restaurants/${restaurantId}`);
        const snapshot = await get(restaurantRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const config =
            data.draftConfig || data.siteConfig || DEFAULT_SITE_CONFIG;
          const initialLayout = (config.layout || []).map((block) => {
            const blockType = BLOCK_TYPES.find((t) => t.type === block.type);
            if (!blockType) return block;
            return {
              ...block,
              props: deepMerge(blockType.defaultProps, block.props || {}),
            };
          });

          setLayout(initialLayout);

          let loadedHeader = BLOCK_TYPES.find(
            (t) => t.type === "HEADER"
          ).defaultProps;
          let loadedFooter = BLOCK_TYPES.find(
            (t) => t.type === "FOOTER"
          ).defaultProps;
          let loadedStyles = DEFAULT_GLOBAL_STYLES;
          let loadedComponentStyles = {
            promotion: "popup",
            restaurant: "card",
          };

          if (config.headerConfig)
            loadedHeader = deepMerge(loadedHeader, config.headerConfig);
          if (config.footerConfig)
            loadedFooter = deepMerge(loadedFooter, config.footerConfig);
          if (config.globalStyles)
            loadedStyles = deepMerge(loadedStyles, config.globalStyles);
          else if (config.themeColor) {
            loadedStyles = {
              ...DEFAULT_GLOBAL_STYLES,
              colors: {
                ...DEFAULT_GLOBAL_STYLES.colors,
                primary: config.themeColor,
              },
            };
          }
          if (config.componentStyles)
            loadedComponentStyles = deepMerge(loadedComponentStyles, config.componentStyles);

          setHeaderConfig(loadedHeader);
          setFooterConfig(loadedFooter);
          setGlobalStyles(loadedStyles);

          setSlug(data.slug || "");
          setOriginalSlug(data.slug || "");

          setHistory([
            {
              layout: initialLayout,
              headerConfig: loadedHeader,
              footerConfig: loadedFooter,
              globalStyles: loadedStyles,
              componentStyles: loadedComponentStyles,
            },
          ]);
          setHistoryIndex(0);
        } else {
          const defaultLayout = DEFAULT_SITE_CONFIG.layout || [];
          setLayout(defaultLayout);
          setHistory([
            {
              layout: defaultLayout,
              headerConfig: BLOCK_TYPES.find((t) => t.type === "HEADER")
                .defaultProps,
              footerConfig: BLOCK_TYPES.find((t) => t.type === "FOOTER")
                .defaultProps,
              globalStyles: DEFAULT_GLOBAL_STYLES,
              componentStyles: {
                promotion: "popup",
                restaurant: "card",
              },
            },
          ]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error("Error loading site config:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSiteConfig();
  }, [restaurantId]);

  const updateState = useCallback(
    (updates) => {
      setLayout((prevLayout) => updates.layout !== undefined ? updates.layout : prevLayout);
      setHeaderConfig((prevHeader) => updates.headerConfig !== undefined ? updates.headerConfig : prevHeader);
      setFooterConfig((prevFooter) => updates.footerConfig !== undefined ? updates.footerConfig : prevFooter);
      setGlobalStyles((prevStyles) => updates.globalStyles !== undefined ? updates.globalStyles : prevStyles);

      
      setHistory((prevHistory) => {
        const currentState = {
          layout: updates.layout !== undefined ? updates.layout : layout,
          headerConfig: updates.headerConfig !== undefined ? updates.headerConfig : headerConfig,
          footerConfig: updates.footerConfig !== undefined ? updates.footerConfig : footerConfig,
          globalStyles: updates.globalStyles !== undefined ? updates.globalStyles : globalStyles,
        };

        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(currentState);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    },
    [layout, headerConfig, footerConfig, globalStyles, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setLayout(prevState.layout || []);
      if (prevState.headerConfig) setHeaderConfig(prevState.headerConfig);
      if (prevState.footerConfig) setFooterConfig(prevState.footerConfig);
      if (prevState.globalStyles) setGlobalStyles(prevState.globalStyles);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setLayout(nextState.layout || []);
      if (nextState.headerConfig) setHeaderConfig(nextState.headerConfig);
      if (nextState.footerConfig) setFooterConfig(nextState.footerConfig);
      if (nextState.globalStyles) setGlobalStyles(nextState.globalStyles);
    }
  };

  const handleAddBlock = (blockType) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType.type,
      props: { ...blockType.defaultProps },
    };
    const newLayout = [...layout, newBlock];
    updateState({ layout: newLayout });
    setSelectedBlockId(newBlock.id);
    setSelectedSection("block");
  };

  const handleRemoveBlock = (blockId) => {
    const newLayout = layout.filter((b) => b.id !== blockId);
    updateState({ layout: newLayout });
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleUpdateBlock = (updatedBlock) => {
    const newLayout = layout.map((b) =>
      b.id === updatedBlock.id ? updatedBlock : b
    );
    updateState({ layout: newLayout });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = layout.findIndex((item) => item.id === active.id);
      const newIndex = layout.findIndex((item) => item.id === over.id);
      const newLayout = arrayMove(layout, oldIndex, newIndex);
      updateState({ layout: newLayout });
    }
  };

  const handleMoveBlockUp = (block) => {
    const index = layout.findIndex((b) => b.id === block.id);
    if (index > 0) {
      const newLayout = [...layout];
      const [removed] = newLayout.splice(index, 1);
      newLayout.splice(index - 1, 0, removed);
      updateState({ layout: newLayout });
      setSelectedBlockId(block.id);
    }
  };

  const handleMoveBlockDown = (block) => {
    const index = layout.findIndex((b) => b.id === block.id);
    if (index < layout.length - 1) {
      const newLayout = [...layout];
      const [removed] = newLayout.splice(index, 1);
      newLayout.splice(index + 1, 0, removed);
      updateState(newLayout);
      setSelectedBlockId(block.id);
    }
  };

  const handleDuplicateBlock = (block) => {
    const index = layout.findIndex((b) => b.id === block.id);
    const copy = { ...block, id: `block-${Date.now()}` };
    const newLayout = [...layout];
    newLayout.splice(index + 1, 0, copy);
    updateState(newLayout);
    setSelectedBlockId(copy.id);
  };

  const handleQuickSwapVariant = (block) => {
    const blockType = BLOCK_TYPES.find((t) => t.type === block.type);
    if (!blockType) return;
    const variantField = blockType.schema?.find((s) => s.name === "variant");
    if (!variantField || !Array.isArray(variantField.options)) return;

    const current = block.props?.variant || variantField.options[0]?.value;
    const opts = variantField.options.map((o) => o.value);
    const idx = opts.indexOf(current);
    const next = opts[(idx + 1) % opts.length];

    handleUpdateBlock({ ...block, props: { ...block.props, variant: next } });
  };

  const handleSaveDraft = async () => {
    if (!restaurantId) return;
    setSaving(true);
    try {
      await update(ref(rtdb, `restaurants/${restaurantId}`), {
        draftConfig: {
          layout: layout,
          headerConfig,
          footerConfig,
          globalStyles,
          updatedAt: new Date().toISOString(),
        },
      });
      showSuccess("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      showError("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!restaurantId) {
      showWarning("No restaurant selected");
      return;
    }

    if (slug && slug !== originalSlug) {
      const available = await isSlugAvailable(slug, restaurantId);
      if (!available) {
        setSlugError("This slug is already taken");
        return;
      }
    }

    try {
      setSaving(true);
      setSlugError("");

      const configData = {
        layout: layout,
        headerConfig,
        footerConfig,
        globalStyles,
        publishedAt: new Date().toISOString(),
      };

      await updateRestaurantSiteConfig(restaurantId, {
        slug: slug || null,
        siteConfig: configData,
        draftConfig: configData,
      });

      setOriginalSlug(slug);
      showSuccess("Site published successfully!");
    } catch (error) {
      console.error("Error publishing site:", error);
      showError("Failed to publish");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSlug = async () => {
    try {
      const restaurantRef = ref(rtdb, `restaurants/${restaurantId}`);
      const snapshot = await get(restaurantRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const generatedSlug = generateSlug(data.name || "");
        setSlug(generatedSlug);
      }
    } catch (error) {
      console.error("Error generating slug:", error);
    }
  };

  const setHeaderConfigCallback = useCallback(
    (config) => updateState({ headerConfig: config }),
    [updateState]
  );
  const setFooterConfigCallback = useCallback(
    (config) => updateState({ footerConfig: config }),
    [updateState]
  );
  const setGlobalStylesCallback = useCallback(
    (styles) => updateState({ globalStyles: styles }),
    [updateState]
  );
  

  const selectedBlock = layout.find((b) => b.id === selectedBlockId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <p>Loading builder...</p>
        </div>
      </div>
    );
  }

  return (
    <ShopProvider restaurantId={restaurantId}>
      <BuilderContent
        restaurantId={restaurantId}
        layout={layout}
        setLayout={setLayout}
        selectedBlockId={selectedBlockId}
        setSelectedBlockId={setSelectedBlockId}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        globalStyles={globalStyles}
        setGlobalStyles={setGlobalStylesCallback}
        headerConfig={headerConfig}
        setHeaderConfig={setHeaderConfigCallback}
        footerConfig={footerConfig}
        setFooterConfig={setFooterConfigCallback}
        slug={slug}
        setSlug={setSlug}
        slugError={slugError}
        saving={saving}
        handleSaveDraft={handleSaveDraft}
        handlePublish={handlePublish}
        handleGenerateSlug={handleGenerateSlug}
        handleAddBlock={handleAddBlock}
        handleRemoveBlock={handleRemoveBlock}
        handleUpdateBlock={handleUpdateBlock}
        handleDragEnd={handleDragEnd}
        handleMoveBlockUp={handleMoveBlockUp}
        handleMoveBlockDown={handleMoveBlockDown}
        handleDuplicateBlock={handleDuplicateBlock}
        handleQuickSwapVariant={handleQuickSwapVariant}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        sensors={sensors}
        selectedBlock={selectedBlock}
        activeControl={activeControl}
        setActiveControl={setActiveControl}
      />
    </ShopProvider>
  );
}
