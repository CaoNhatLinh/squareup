export function listAllSchemaFieldNames(schema = []) {
  const fields = new Set();
  for (const entry of schema) {
    if (entry.fields && Array.isArray(entry.fields)) {
      for (const f of entry.fields) {
        if (typeof f === 'string') fields.add(f);
        else if (f && f.name) fields.add(f.name);
      }
    }
  }
  return Array.from(fields);
}

export function findGroupForControlId(schema = [], controlId) {
  
  
  if (!controlId) return null;
  for (const entry of schema) {
    if (entry.highlightControlId && entry.highlightControlId === controlId) return entry;
    if (entry.elementSchema && controlId.startsWith(entry.elementSchema.controlIdPrefix)) return entry;
  }
  return null;
}

export function computeExcludedFields({ schema = [], selectedBlock = null, globalUseRealData = false, activeControl = null }) {
  const base = ['variant'];

  const excludes = new Set(base);

  const blockUseReal = (selectedBlock && selectedBlock.props && selectedBlock.props.useRealData) || globalUseRealData;
  if (blockUseReal) {
    ['links', 'items', 'categories', 'content'].forEach(f => excludes.add(f));
  }

  
  if (activeControl && activeControl.controlId && activeControl.blockId && selectedBlock && activeControl.blockId === selectedBlock.id) {
    const group = findGroupForControlId(schema, activeControl.controlId);
    if (group && group.group) {
      
      for (const entry of schema) {
        if (entry.group && entry.group !== group.group) {
          if (entry.fields && Array.isArray(entry.fields)) {
            for (const f of entry.fields) {
              excludes.add(typeof f === 'string' ? f : f.name);
            }
          }
        }
      }
    }
  }

  return Array.from(excludes);
}

export function computeSchemaPanelOptions({ schema = [], selectedBlock = null, globalUseRealData = false, activeControl = null }) {
  const excludeFields = computeExcludedFields({ schema, selectedBlock, globalUseRealData, activeControl });
  let forceShowGroupElements = false;
  try {
    const blockType = selectedBlock && (selectedBlock.type || selectedBlock.id || selectedBlock?.props?.type);
    if (blockType === 'HEADER' || blockType === 'FOOTER') {
      forceShowGroupElements = true;
    }
  } catch {
    
  }
  return { excludeFields, forceShowGroupElements };
}

export function applyNavPropsToLinks(updatedConfig, currentConfig) {
  if (!updatedConfig || !currentConfig) return updatedConfig;
  const navProps = ['color', 'bold', 'italic', 'underline', 'fontSize'];
  let result = { ...updatedConfig };
  if (result.navigation && currentConfig.navigation) {
    navProps.forEach(prop => {
      if (result.navigation[prop] !== currentConfig.navigation[prop]) {
        if (Array.isArray(result.navigation.links)) {
          result = {
            ...result,
            navigation: {
              ...result.navigation,
              links: result.navigation.links.map(link => ({ ...link, [prop]: result.navigation[prop] }))
            }
          };
        }
      }
    });
  }
  return result;
}
