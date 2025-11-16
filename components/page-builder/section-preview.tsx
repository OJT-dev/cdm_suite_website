
'use client';

import { Section } from '@/lib/page-templates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface SectionPreviewProps {
  section: Section;
}

export function SectionPreview({ section }: SectionPreviewProps) {
  const renderSection = () => {
    // Helper function to get correct image URL
    const getImageUrl = (path: string) => {
      if (!path) return '';
      return path.startsWith('uploads/') ? `/api/file/${encodeURIComponent(path)}` : path;
    };

    switch (section.type) {
      case 'hero':
        return (
          <div
            className="relative py-20 px-4"
            style={{
              backgroundImage: section.data.backgroundImage
                ? `url(${getImageUrl(section.data.backgroundImage)})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="relative max-w-4xl mx-auto"
              style={{ textAlign: section.data.alignment || 'center' }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {section.data.headline || 'Hero Headline'}
              </h1>
              <p className="text-xl text-white/90 mb-8">
                {section.data.subheading || 'Hero subheading'}
              </p>
              {section.data.ctaText && (
                <Button size="lg">
                  {section.data.ctaText}
                </Button>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="py-12 px-4">
            <div
              className="prose max-w-4xl mx-auto"
              style={{ textAlign: section.data.alignment || 'left' }}
              dangerouslySetInnerHTML={{ __html: section.data.content || '<p>Text content</p>' }}
            />
          </div>
        );

      case 'features':
        return (
          <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              {section.data.title && (
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-2">{section.data.title}</h2>
                  {section.data.subtitle && (
                    <p className="text-lg text-muted-foreground">{section.data.subtitle}</p>
                  )}
                </div>
              )}
              <div
                className="grid gap-8"
                style={{
                  gridTemplateColumns: `repeat(${section.data.columns || 3}, minmax(0, 1fr))`,
                }}
              >
                {(section.data.items || []).map((item: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-4">{item.icon || '📦'}</div>
                      <h3 className="text-xl font-semibold mb-2">{item.title || 'Feature'}</h3>
                      <p className="text-muted-foreground">
                        {item.description || 'Feature description'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cta':
        const bgColors: Record<string, string> = {
          blue: 'bg-blue-600',
          purple: 'bg-purple-600',
          green: 'bg-green-600',
          gray: 'bg-gray-800',
        };
        return (
          <div className={`py-16 px-4 ${bgColors[section.data.backgroundColor] || 'bg-blue-600'}`}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {section.data.headline || 'Ready to get started?'}
              </h2>
              {section.data.subheadline && (
                <p className="text-xl text-white/90 mb-8">{section.data.subheadline}</p>
              )}
              {section.data.buttonText && (
                <Button size="lg" variant="secondary">
                  {section.data.buttonText}
                </Button>
              )}
            </div>
          </div>
        );

      case 'image':
        const widthClasses: Record<string, string> = {
          small: 'max-w-md',
          medium: 'max-w-2xl',
          large: 'max-w-4xl',
          full: 'max-w-full',
        };
        return (
          <div className="py-8 px-4">
            <div className={`mx-auto ${widthClasses[section.data.width] || 'max-w-4xl'}`}>
              {section.data.src ? (
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(section.data.src)}
                    alt={section.data.alt || ''}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No image selected</p>
                </div>
              )}
              {section.data.caption && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {section.data.caption}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="py-12 px-4 bg-muted/50">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-muted-foreground">
                Preview for {section.type} section
              </p>
            </div>
          </div>
        );
    }
  };

  return <div className="border rounded-lg overflow-hidden">{renderSection()}</div>;
}
