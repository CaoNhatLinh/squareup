import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { HiChevronRight } from 'react-icons/hi'

export default function MenuItem({ item, level = 0 }) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)
  const Icon = item.icon
  
  const hasActiveChild = React.useMemo(() => {
    if (!item.children) return false
    
    const checkActive = (children) => {
      return children.some(child => {
        if (child.to && location.pathname.startsWith(child.to)) return true
        if (child.children) return checkActive(child.children)
        return false
      })
    }
    
    return checkActive(item.children)
  }, [item.children, location.pathname])
  
  React.useEffect(() => {
    if (hasActiveChild) {
      setExpanded(true)
    }
  }, [hasActiveChild])
  
  const hasChildren = item.children && item.children.length > 0
  const paddingLeft = `${(level + 1) * 16}px`
  
  if (!hasChildren && item.to) {
    return (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-md text-sm text-gray-700 hover:bg-gray-50 ${
            isActive ? 'bg-blue-50 text-blue-700 font-medium' : ''
          }`
        }
        style={{ paddingLeft }}
      >
        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
        <span>{item.label}</span>
      </NavLink>
    )
  }
  
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm text-gray-700 hover:bg-gray-50 ${
            hasActiveChild ? 'bg-gray-100 font-medium' : ''
          }`}
          style={{ paddingLeft }}
        >
          {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
          <span className="flex-1 text-left">{item.label}</span>
          <HiChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
        </button>
        {expanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child, idx) => (
              <MenuItem key={idx} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  return null
}
