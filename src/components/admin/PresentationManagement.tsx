import React, { useState, useEffect } from 'react';
import { supabase, Presentation } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface PresentationManagementProps {
  selectedProject: string | null;
  onPresentationSelect: (presentationId: string | null) => void;
  selectedPresentation: string | null;
}

export function PresentationManagement({ 
  selectedProject, 
  onPresentationSelect, 
  selectedPresentation 
}: PresentationManagementProps) {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const [formData, setFormData] = useState({ title: '' });
  const { user, canEdit } = useAuthContext();

  useEffect(() => {
    if (selectedProject) {
      fetchPresentations();
    } else {
      setPresentations([]);
      setLoading(false);
    }
  }, [selectedProject]);

  const fetchPresentations = async () => {
    if (!selectedProject) return;

    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('project_id', selectedProject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresentations(data || []);
    } catch (error) {
      console.error('Error fetching presentations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProject) return;

    try {
      if (editingPresentation) {
        const { error } = await supabase
          .from('presentations')
          .update({
            title: formData.title,
          })
          .eq('id', editingPresentation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('presentations')
          .insert({
            title: formData.title,
            project_id: selectedProject,
            created_by: user.id,
          });

        if (error) throw error;
      }

      setFormData({ title: '' });
      setEditingPresentation(null);
      setIsCreateOpen(false);
      fetchPresentations();
    } catch (error) {
      console.error('Error saving presentation:', error);
    }
  };

  const handleEdit = (presentation: Presentation) => {
    setEditingPresentation(presentation);
    setFormData({ title: presentation.title });
    setIsCreateOpen(true);
  };

  const handleDelete = async (presentationId: string) => {
    if (!confirm('Are you sure you want to delete this presentation?')) return;

    try {
      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', presentationId);

      if (error) throw error;
      fetchPresentations();
      if (selectedPresentation === presentationId) {
        onPresentationSelect(null);
      }
    } catch (error) {
      console.error('Error deleting presentation:', error);
    }
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Please select a project to manage presentations.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <div>Loading presentations...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Presentation Management</CardTitle>
        {canEdit() && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPresentation(null);
                setFormData({ title: '' });
              }}>
                Create Presentation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPresentation ? 'Edit Presentation' : 'Create New Presentation'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPresentation ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {presentations.map((presentation) => (
            <div 
              key={presentation.id} 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPresentation === presentation.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => onPresentationSelect(presentation.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{presentation.title}</h3>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(presentation.created_at).toLocaleDateString()}
                  </p>
                </div>
                {canEdit() && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(presentation);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(presentation.id);
                      }}
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