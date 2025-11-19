
'use client';

import React, { forwardRef, useState } from 'react';
import { PageBlock, FormProps } from '@/lib/page-builder-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FormBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const FormBlock = forwardRef<HTMLDivElement, FormBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as FormProps;
    const [formData, setFormData] = useState<Record<string, string>>({});

    const style: React.CSSProperties = {
      padding: props.padding || '4rem 2rem',
      margin: props.margin,
      backgroundColor: props.backgroundColor,
      ...props.style,
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isPreview) return;

      try {
        const response = await fetch(props.submitEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          alert('Form submitted successfully!');
          setFormData({});
        }
      } catch (error) {
        alert('Failed to submit form');
      }
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'relative',
          !isPreview && 'hover:outline hover:outline-2 hover:outline-blue-400 cursor-pointer',
          isSelected && 'outline outline-2 outline-blue-600',
          props.className
        )}
        style={style}
      >
        <div className="max-w-2xl mx-auto">
          {props.title && (
            <h2 className="text-3xl font-bold text-center mb-8">
              {props.title}
            </h2>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {props.fields.map((field, index) => (
              <div key={index}>
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    disabled={!isPreview}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, [field.name]: value })
                    }
                    disabled={!isPreview}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option, oIndex) => (
                        <SelectItem key={oIndex} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    disabled={!isPreview}
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={!isPreview}>
              {props.submitText}
            </Button>
          </form>
        </div>
      </div>
    );
  }
);

FormBlock.displayName = 'FormBlock';
