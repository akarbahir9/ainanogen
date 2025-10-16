import { useState } from 'react';
import { AdGeneratorForm } from './components/AdGeneratorForm';
import { ImageDisplay } from './components/ImageDisplay';
import { useAdGenerator } from './hooks/useAdGenerator';
import { Toast } from './components/ui/Toast';
import { Github } from 'lucide-react';

export default function App() {
  const { generateAd, editAd, ...generationState } = useAdGenerator();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [currentPrompt, setCurrentPrompt] = useState('A sleek, futuristic electric car driving on a rainbow road in a cyberpunk city, high detail, cinematic lighting');

  const handleGenerate = async (prompt: string, image_size: string, output_format: string) => {
    setToast(null);
    setAspectRatio(image_size);
    setCurrentPrompt(prompt);

    try {
      await generateAd({ prompt, image_size, output_format });
      setToast({ message: 'Ad generated successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.error || 'An unknown error occurred.', type: 'error' });
    }
  };

  const handleEdit = async (editPrompt: string, imageUrl: string) => {
    if (!editPrompt.trim() || !imageUrl) return;
    setToast(null);

    try {
      await editAd({ editPrompt, imageUrl });
      setToast({ message: 'Edit applied successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.error || 'An unknown error occurred.', type: 'error' });
    }
  };

  const handleDownloadError = (message: string) => {
    setToast({ message, type: 'error' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-700/50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Creative Ad Generator</h1>
          <a
            href="https://github.com/dualitedev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dualite Dev GitHub"
          >
            <Github size={24} />
          </a>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col">
            <AdGeneratorForm 
              onGenerate={handleGenerate} 
              isLoading={generationState.isLoading}
              currentPrompt={currentPrompt}
            />
          </div>
          <div className="flex flex-col">
             <ImageDisplay
               {...generationState}
               aspectRatio={aspectRatio}
               onDownloadError={handleDownloadError}
               onEdit={handleEdit}
             />
          </div>
        </div>
      </main>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
