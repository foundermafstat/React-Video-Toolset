import React, { useState, useEffect } from 'react';
import { supabase, Slide } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface SlideManagementProps {
  selectedPresentation: string | null;
}

export function SlideManagement({ selectedPresentation }: SlideManagementProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({ content: '{}', order: 0 });
  const { user, canEdit } = useAuthContext();

  useEffect(() => {
    if (selectedPresentation) {
      fetchSlides();
    } else {
      setSlides([]);
      setLoading(false);
    }
  }, [selectedPresentation]);

  const fetchSlides = async () => {
    if (!selectedPresentation) return;

    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('presentation_id', selectedPresentation)
        .order('slide_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPresentation) return;

    try {
      let content;
      try {
        content = JSON.parse(formData.content);
      } catch {
        content = { text: formData.content };
      }

      if (editingSlide) {
        const { error } = await supabase
          .from('slides')
          .update({
            content,
            slide_order: formData.order,
          })
          .eq('id', editingSlide.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('slides')
          .insert({
            presentation_id: selectedPresentation,
            content,
            slide_order: formData.order,
            created_by: user.id,
          });

        if (error) throw error;
      }

      setFormData({ content: '{}', order: 0 });
      setEditingSlide(null);
      setIsCreateOpen(false);
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({ 
      content: JSON.stringify(slide.content, null, 2), 
      order: slide.slide_order 
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (slideId: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideId);

      if (error) throw error;
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  if (!selectedPresentation) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Please select a presentation to manage slides.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <div>Loading slides...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Slide Management</CardTitle>
        {canEdit() && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSlide(null);
                setFormData({ content: '{}', order: slides.length });
              }}>
                Create Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSlide ? 'Edit Slide' : 'Create New Slide'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content (JSON)</Label>
                  <textarea
                    id="content"
                    className="w-full h-40 p-2 border rounded-md font-mono text-sm"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder='{"text": "Slide content", "background": "#ffffff"}'
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSlide ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {slides.map((slide) => (
            <div key={slide.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Slide #{slide.slide_order + 1}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Content: {JSON.stringify(slide.content).substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(slide.created_at).toLocaleDateString()}
                  </p>
                </div>
                {canEdit() && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(slide)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(slide.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}