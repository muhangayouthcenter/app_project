import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './header.css';

export default function Header() {

  const [maximized, setMaximized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.electron?.ipcRenderer.on("is-maximized", () => {
      setMaximized(true);
    });
    window.electron?.ipcRenderer.on("is-unmaximized", () => {
      setMaximized(false);
    });
  }, []);
  return (
    <header className="app-header">

      <div className="header-left no-drag" title="Reload application" onClick={() => {
        window.location = '/';
      }}>
        <svg className="w-[43px] h-[43px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023" />
        </svg>
        <pre>MYCDARS</pre>
      </div>

      <div className="header-right">
        <div className="mac-window-controls no-drag right-controls" aria-hidden="true">
          <div className="mac-btn mac-close" title="Close" onClick={() => window.windowControls.close()}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6L18 18M6 18L18 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mac-btn mac-minimize" title="Minimize" onClick={() => window.windowControls.minimize()}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mac-btn mac-maximize" title="Maximize" onClick={() => window.windowControls.maximize()}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" stroke="#fff" strokeWidth="1.7" rx="1" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}