export interface ToastProps {
  variant?: 'default' | 'destructive';
  title?: string;
  description?: string;
}

const TOAST_CONTAINER_ID = 'app-toast-container';

export function toast(props: ToastProps) {
  const { variant = 'default', title, description } = props;

  console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);

  if (typeof document !== 'undefined') {
    let container = document.getElementById(TOAST_CONTAINER_ID);

    if (!container) {
      container = document.createElement('div');
      container.id = TOAST_CONTAINER_ID;
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        display: grid;
        gap: 10px;
        z-index: 2147483647;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toastElement = document.createElement('div');
    toastElement.style.cssText = `
      width: min(360px, calc(100vw - 40px));
      padding: 14px 16px;
      border-radius: 12px;
      background: ${variant === 'destructive' ? '#8f2f24' : '#214f34'};
      color: white;
      box-shadow: 0 18px 42px rgba(20, 34, 26, .22);
      border: 1px solid rgba(255, 255, 255, .18);
      animation: slideIn .22s ease-out;
      pointer-events: auto;
    `;

    const titleElement = document.createElement('div');
    titleElement.textContent = title || (variant === 'destructive' ? 'Error' : 'Listo');
    titleElement.style.cssText = 'font-weight: 800; margin-bottom: 4px;';

    const descriptionElement = document.createElement('div');
    descriptionElement.textContent = description || '';
    descriptionElement.style.cssText = 'font-size: 13px; line-height: 1.35;';

    toastElement.appendChild(titleElement);
    toastElement.appendChild(descriptionElement);
    container.appendChild(toastElement);

    setTimeout(() => {
      toastElement.style.animation = 'slideOut .22s ease-out';
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
