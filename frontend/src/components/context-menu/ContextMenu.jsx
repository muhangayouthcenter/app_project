import React, { useState, useEffect, useRef } from 'react';
import './context-menu.css';

export default function ContextMenu({ items, show, position, onClose }) {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!show || !menuRef.current) return;

   
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = position.x;
    let adjustedY = position.y;

  
    if (position.x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

  
    if (position.y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }

   
    if (adjustedY < 0) {
      adjustedY = 10;
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [show, position, menuRef]);

  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose]);

  if (!show) return null;

  const handleItemClick = (action) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        top: `${adjustedPosition.y}px`,
        left: `${adjustedPosition.x}px`,
      }}
    >
      <ul className="context-menu-list">
        {items.map((item, index) => (
          <li key={index}>
            {item.type === 'divider' ? (
              <div className="context-menu-divider" />
            ) : (
              <button
                className={`context-menu-item ${item.danger ? 'danger' : ''}`}
                onClick={() => handleItemClick(item.action)}
                title={item.tooltip || item.label}
              >
                <pre className="context-menu-label">{item.label}</pre>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
