import { Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { CardDesignProvider } from './context/CardDesignContext';
import { TopNav } from './components/TopNav';
import { HomePage } from './components/HomePage';
import { LearnPage } from './components/LearnPage';
import { InstructionsView } from './components/InstructionsView';
import { CreateLanding } from './components/CreateLanding';
import { UploadPage } from './components/UploadPage';
import { DesignElementGallery } from './components/DesignElementGallery';
import { DesignVariantPicker } from './components/DesignVariantPicker';
import { LayerEditor } from './components/LayerEditor';
import { Preview3DPage } from './components/Preview3DPage';
import { CardFinalization } from './components/CardFinalization';
import { SavedCardsList } from './components/SavedCardsList';

export default function App() {
  return (
    <CardDesignProvider>
      <div className="min-h-screen bg-white">
        <TopNav />
        <Routes>
          <Route path="/"                          element={<HomePage />} />
          <Route path="/learn"                     element={<LearnPage />} />
          <Route path="/learn/:mechanismId"        element={<InstructionsView />} />
          <Route path="/create"                    element={<CreateLanding />} />
          <Route path="/create/upload"             element={<UploadPage />} />
          <Route path="/create/elements"           element={<DesignElementGallery />} />
          <Route path="/create/elements/:themeId"  element={<DesignVariantPicker />} />
          <Route path="/create/editor"             element={<LayerEditor />} />
          <Route path="/create/preview"            element={<Preview3DPage />} />
          <Route path="/create/export"             element={<CardFinalization />} />
          <Route path="/my-cards"                  element={<SavedCardsList />} />
          <Route path="*"                          element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster richColors position="bottom-right" />
      </div>
    </CardDesignProvider>
  );
}
