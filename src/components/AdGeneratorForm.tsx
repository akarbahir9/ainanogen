import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Label } from './ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

interface AdGeneratorFormProps {
  onGenerate: (prompt: string, image_size: string, output_format: string) => void;
  isLoading: boolean;
  currentPrompt: string;
}

const imageSizeOptions = [
  { value: '1:1', label: '1:1 (Square)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '3:4', label: '3:4 (Portrait)' },
  { value: '4:3', label: '4:3 (Landscape)' },
  { value: '3:2', label: '3:2 (Landscape)' },
  { value: '2:3', label: '2:3 (Portrait)' },
];

const outputFormatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
];

export function AdGeneratorForm({ onGenerate, isLoading, currentPrompt }: AdGeneratorFormProps) {
  const [prompt, setPrompt] = useState(currentPrompt);
  const [imageSize, setImageSize] = useState('1:1');
  const [outputFormat, setOutputFormat] = useState('png');

  useEffect(() => {
    setPrompt(currentPrompt);
  }, [currentPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, imageSize, outputFormat);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Describe Your Ad</CardTitle>
        <CardDescription>Enter a detailed prompt to generate a unique ad visual.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A golden retriever wearing sunglasses, surfing on a wave of soda"
              rows={5}
              maxLength={5000}
              required
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image-size">Image Size</Label>
              <Select
                id="image-size"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                options={imageSizeOptions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output-format">Output Format</Label>
              <Select
                id="output-format"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                options={outputFormatOptions}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Ad'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
