import { useState, useRef } from 'react';
import { Download, Image as ImageIcon, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabaseClient';
import { Textarea } from './ui/Textarea';
import { Label } from './ui/Label';

interface ImageDisplayProps {
  isLoading: boolean;
  isEditing: boolean;
  imageUrl: string | null;
  error: string | null;
  aspectRatio: string;
  onDownloadError: (message: string) => void;
  onEdit: (editPrompt: string, imageUrl: string) => void;
}

export function ImageDisplay({ isLoading, isEditing, imageUrl, error, aspectRatio, onDownloadError, onEdit }: ImageDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [editPrompt, setEditPrompt] = useState('');
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!imageUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/kie-proxy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'proxy-download',
          payload: { imageUrl },
        }),
      });

      if (!response.ok) {
        let errorMessage = `Download failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileExtension = new URL(imageUrl).pathname.split('.').pop() || 'png';
      link.download = `creative-ad-${Date.now()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download failed:", err);
      onDownloadError(err.message || 'Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setTransform(prev => {
      const newScale = direction === 'in' ? prev.scale * 1.2 : prev.scale / 1.2;
      const clampedScale = Math.max(0.5, Math.min(newScale, 5));
      if (clampedScale <= 1) {
        return { scale: clampedScale, x: 0, y: 0 };
      }
      return { ...prev, scale: clampedScale };
    });
  };

  const handleReset = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (transform.scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setStartDragPos({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || transform.scale <= 1) return;
    e.preventDefault();
    const newX = e.clientX - startDragPos.x;
    const newY = e.clientY - startDragPos.y;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleApplyEdit = () => {
    if (imageUrl) {
      onEdit(editPrompt, imageUrl);
    }
  };

  const getAspectRatioStyle = (ratio: string) => {
    if (!ratio || ratio === 'auto' || isLoading || !imageUrl) {
      return { aspectRatio: '1 / 1' };
    }
    const [w, h] = ratio.split(':');
    if (!w || !h) {
      return { aspectRatio: '1 / 1' };
    }
    return { aspectRatio: `${w} / ${h}` };
  };

  const renderContent = () => {
    if (isLoading || isEditing) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-400">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
          <p className="text-lg">{isEditing ? 'Applying your edits...' : 'Generating your ad...'}</p>
          <p className="text-sm text-center">This may take a moment. Please wait.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
          <h3 className="text-lg font-semibold">Operation Failed</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      );
    }
    
    if (imageUrl) {
      return (
        <div className="w-full h-full flex flex-col">
          <div
            ref={imageContainerRef}
            className="flex-grow relative bg-gray-900 rounded-md overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            <img
              src={imageUrl}
              alt="Generated ad creative"
              className="absolute top-0 left-0 w-full h-full object-contain transition-transform duration-150 ease-out"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                cursor: isDragging ? 'grabbing' : (transform.scale > 1 ? 'grab' : 'default'),
                willChange: 'transform',
              }}
              draggable={false}
            />
          </div>
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Button onClick={() => handleZoom('in')} variant="secondary" size="sm" aria-label="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button onClick={() => handleZoom('out')} variant="secondary" size="sm" aria-label="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button onClick={handleReset} variant="secondary" size="sm" aria-label="Reset View">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleDownload} disabled={isDownloading} variant="secondary">
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-500">
        <ImageIcon className="h-16 w-16" />
        <p className="text-lg text-center">Your generated ad will appear here.</p>
      </div>
    );
  };

  return (
    <Card className="flex-grow flex flex-col">
      <CardContent className="p-6 flex-grow flex flex-col">
        <div
          className="w-full bg-gray-800/50 rounded-lg flex items-center justify-center p-4 transition-all duration-300 ease-in-out"
          style={getAspectRatioStyle(aspectRatio)}
        >
          {renderContent()}
        </div>
        {imageUrl && !isLoading && !isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
            <Label htmlFor="edit-prompt" className="text-lg font-semibold">Edit Image</Label>
            <Textarea
              id="edit-prompt"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g., Change the car to blue, add a sunset in the background"
              rows={3}
              className="resize-none"
            />
            <Button onClick={handleApplyEdit} disabled={isEditing || !editPrompt.trim()} className="w-full">
              {isEditing ? 'Applying...' : 'Apply Edit'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
