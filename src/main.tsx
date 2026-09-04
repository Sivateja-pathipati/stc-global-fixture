import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import RgtGlobalApp from '@/RgtGlobalApp';
import '@/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <RgtGlobalApp />
    </BrowserRouter>
  </StrictMode>,
);
