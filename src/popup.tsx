import { createRoot } from 'react-dom/client';
import ExtensionPopup from './components/ExtensionPopup';
import './index.css';

const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<ExtensionPopup />);
}