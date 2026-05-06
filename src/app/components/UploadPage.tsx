import { useNavigate } from 'react-router';
import { useCardDesign } from '../context/CardDesignContext';
import { UploadSection } from './UploadSection';
import { AnalysisResults } from './AnalysisResults';

export function UploadPage() {
  const navigate = useNavigate();
  const { uploadedImage, handleImageUpload, setUploadedImage, setAnalysisData, setIsAnalyzing } =
    useCardDesign();

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setAnalysisData(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-12">
        {!uploadedImage ? (
          <UploadSection onImageUpload={handleImageUpload} />
        ) : (
          <AnalysisResults
            imageUrl={uploadedImage}
            onRemoveImage={handleRemoveImage}
            onProceed={() => navigate('/create/editor')}
          />
        )}
      </main>
    </div>
  );
}
