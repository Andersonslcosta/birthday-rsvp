import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { InvitePage } from './components/InvitePage';
import { AdminPanel } from './components/AdminPanel';
import { Suspense } from 'react';

function ErrorFallback() {
  console.error('App Error: Failed to render component');
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Erro ao carregar a aplicação</h1>
      <p>Por favor, recarregue a página (F5)</p>
      <details style={{ marginTop: '20px' }}>
        <summary>Debug Info</summary>
        <pre style={{ background: '#f0f0f0', padding: '10px' }}>
          API_URL: {import.meta.env.VITE_API_URL || 'http://localhost:5000'}
        </pre>
      </details>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: '20px' }}>Carregando...</div>}>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<InvitePage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
