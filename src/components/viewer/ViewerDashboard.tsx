import React, { useState, useEffect } from 'react';
import { supabase, Project, Presentation, Slide } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ViewerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchPresentations(selectedProject.id);
    } else {
      setPresentations([]);
      setSelectedPresentation(null);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedPresentation) {
      fetchSlides(selectedPresentation.id);
    } else {
      setSlides([]);
    }
  }, [selectedPresentation]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresentations = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresentations(data || []);
    } catch (error) {
      console.error('Error fetching presentations:', error);
    }
  };

  const fetchSlides = async (presentationId: string) => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('presentation_id', presentationId)
        .order('slide_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Viewer Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant={selectedProject?.id === project.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedProject(project)}
                >
                  {project.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Presentations */}
        <Card>
          <CardHeader>
            <CardTitle>Presentations</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProject ? (
              <div className="space-y-2">
                {presentations.map((presentation) => (
                  <Button
                    key={presentation.id}
                    variant={selectedPresentation?.id === presentation.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedPresentation(presentation)}
                  >
                    {presentation.title}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Select a project to view presentations</p>
            )}
          </CardContent>
        </Card>

        {/* Slides */}
        <Card>
          <CardHeader>
            <CardTitle>Slides</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPresentation ? (
              <div className="space-y-4">
                {slides.map((slide, index) => (
                  <div key={slide.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">Slide {index + 1}</h4>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <pre>{JSON.stringify(slide.content, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Select a presentation to view slides</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}