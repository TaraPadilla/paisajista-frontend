export interface ToastProps {
  variant?: 'default' | 'destructive';
  title?: string;
  description?: string;
}

export function toast(props: ToastProps) {
  const { variant = 'default', title, description } = props;
  
  // Simple console-based toast for now
  // TODO: Replace with a proper toast library like sonner or react-hot-toast
  console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
  
  // Optional: Create a simple DOM-based notification
  if (typeof document !== 'undefined') {
    const toastElement = document.createElement('div');
    toastElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px;
      border-radius: 8px;
      background: ${variant === 'destructive' ? '#ef4444' : '#22c55e'};
      color: white;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    toastElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${title || ''}</div>
      <div style="font-size: 14px;">${description || ''}</div>
    `;
    
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toastElement.remove(), 300);
    }, 3000);
  }
}

// Add animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
