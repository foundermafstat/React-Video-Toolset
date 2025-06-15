import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from './UserManagement';
import { ProjectManagement } from './ProjectManagement';
import { PresentationManagement } from './PresentationManagement';
import { SlideManagement } from './SlideManagement';

export function AdminPanel() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="presentations">Presentations</TabsTrigger>
          <TabsTrigger value="slides">Slides</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="projects">
          <ProjectManagement 
            onProjectSelect={setSelectedProject}
            selectedProject={selectedProject}
          />
        </TabsContent>
        
        <TabsContent value="presentations">
          <PresentationManagement 
            selectedProject={selectedProject}
            onPresentationSelect={setSelectedPresentation}
            selectedPresentation={selectedPresentation}
          />
        </TabsContent>
        
        <TabsContent value="slides">
          <SlideManagement 
            selectedPresentation={selectedPresentation}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}