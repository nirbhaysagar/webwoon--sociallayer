import React from 'react';
import { Platform, View, ViewStyle } from 'react-native';

interface WebCompatibilityWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  webProps?: any;
  mobileProps?: any;
}

export const WebCompatibilityWrapper: React.FC<WebCompatibilityWrapperProps> = ({
  children,
  style,
  webProps = {},
  mobileProps = {},
}) => {
  const isWeb = Platform.OS === 'web';
  
  return (
    <View
      style={style}
      {...(isWeb ? webProps : mobileProps)}
    >
      {children}
    </View>
  );
};

// Web-specific button component
export const WebButton: React.FC<any> = ({ children, style, onPress, ...props }) => {
  const isWeb = Platform.OS === 'web';
  
  if (isWeb) {
    return (
      <button
        onClick={onPress}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
};

// Web-specific input component
export const WebInput: React.FC<any> = ({ style, ...props }) => {
  const isWeb = Platform.OS === 'web';
  
  if (isWeb) {
    return (
      <input
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          ...style,
        }}
        {...props}
      />
    );
  }
  
  return null; // Use regular TextInput on mobile
};

// Web-specific modal component
export const WebModal: React.FC<any> = ({ visible, children, onClose, style }) => {
  const isWeb = Platform.OS === 'web';
  
  if (!isWeb || !visible) {
    return null;
  }
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// Web-specific keyboard shortcuts
export const useWebKeyboardShortcuts = () => {
  const isWeb = Platform.OS === 'web';
  
  React.useEffect(() => {
    if (!isWeb) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Navigate to search
      }
      
      // Escape to close modals
      if (event.key === 'Escape') {
        // Close active modal
      }
      
      // Ctrl/Cmd + Enter for form submission
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        // Submit active form
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWeb]);
};

// Web-specific right-click context menu
export const useWebContextMenu = (menuItems: Array<{ label: string; action: () => void }>) => {
  const isWeb = Platform.OS === 'web';
  
  React.useEffect(() => {
    if (!isWeb) return;
    
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      
      // Create context menu
      const menu = document.createElement('div');
      menu.style.cssText = `
        position: fixed;
        top: ${event.clientY}px;
        left: ${event.clientX}px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 8px 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
      `;
      
      menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.textContent = item.label;
        menuItem.style.cssText = `
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
        `;
        menuItem.onclick = () => {
          item.action();
          document.body.removeChild(menu);
        };
        menuItem.onmouseover = () => {
          menuItem.style.backgroundColor = '#f5f5f5';
        };
        menuItem.onmouseout = () => {
          menuItem.style.backgroundColor = 'transparent';
        };
        menu.appendChild(menuItem);
      });
      
      document.body.appendChild(menu);
      
      // Remove menu when clicking outside
      const removeMenu = () => {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
        document.removeEventListener('click', removeMenu);
      };
      
      setTimeout(() => {
        document.addEventListener('click', removeMenu);
      }, 0);
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isWeb, menuItems]);
}; 