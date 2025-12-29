import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { Gallery } from './components/Gallery';
import { Project, DesignInputs, GeneratedImage } from './types';
import { DEFAULT_INPUTS, DESIGN_STYLES } from './constants';
import { generateDesign, editDesign } from './services/geminiService';
import { ApiKeyModal } from './components/ApiKeyModal';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Theme Toggle
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Get active project
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Helper to update current project inputs
  const updateActiveInputs = (newInputs: DesignInputs) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, inputs: newInputs } : p
    ));
  };

  // Create New Project
  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Dự án ${projects.length + 1}`,
      createdAt: Date.now(),
      inputs: { ...DEFAULT_INPUTS },
      images: []
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
  };

  // Handle Generation Logic
  const handleGenerate = async () => {
    if (!activeProject || isGenerating) return;

    setIsGenerating(true);
    const { inputs } = activeProject;

    // Determine styles to iterate. 
    // If count > 1, we pick distinct styles from DESIGN_STYLES.
    // If count == 1, pick a random one or use 'Modern'
    let stylesToUse: string[] = [];
    if (inputs.variationCount === 1) {
      stylesToUse = [DESIGN_STYLES[0]]; // Default first style
    } else {
      stylesToUse = DESIGN_STYLES.slice(0, inputs.variationCount);
    }

    try {
      // We generate sequentially to show results immediately as requested
      for (const style of stylesToUse) {
        const base64Image = await generateDesign(inputs, style);

        const newImage: GeneratedImage = {
          id: Date.now().toString() + Math.random().toString(),
          url: base64Image,
          promptUsed: inputs.description,
          styleName: style,
          timestamp: Date.now(),
          aspectRatio: inputs.aspectRatio
        };

        // Update project state immediately
        setProjects(currentProjects =>
          currentProjects.map(p =>
            p.id === activeProjectId
              ? { ...p, images: [newImage, ...p.images] }
              : p
          )
        );
      }
    } catch (error: any) {
      console.error("Failed to generate:", error);

      let message = "Không thể tạo hình ảnh. Vui lòng thử lại.";
      // Check for custom error messages thrown by service
      if (error.message) {
        message = error.message;
      }

      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Recreate/Edit
  const handleRecreate = async (originalImage: GeneratedImage, prompt: string) => {
    if (!activeProject) return;
    setIsGenerating(true);

    try {
      const newBase64 = await editDesign(originalImage.url, prompt, originalImage.aspectRatio);

      const newImage: GeneratedImage = {
        id: Date.now().toString() + Math.random().toString(),
        url: newBase64,
        promptUsed: prompt,
        styleName: `${originalImage.styleName} (Chỉnh sửa)`,
        timestamp: Date.now(),
        aspectRatio: originalImage.aspectRatio
      };

      setProjects(currentProjects =>
        currentProjects.map(p =>
          p.id === activeProjectId
            ? { ...p, images: [newImage, ...p.images] }
            : p
        )
      );
    } catch (error: any) {
      console.error("Failed to edit:", error);
      let message = "Không thể chỉnh sửa hình ảnh.";
      if (error.message) {
        message = error.message;
      }
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initialize first project if none
  useEffect(() => {
    if (projects.length === 0) {
      handleCreateProject();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* 1. Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onCreateProject={handleCreateProject}
        isCompact={!!activeProjectId} // Compact when we have a project open (which is always true after init)
        toggleTheme={toggleTheme}
        isDark={isDark}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative transition-all duration-300">
        {activeProject ? (
          <>
            {/* 2. Input Panel */}
            <InputForm
              inputs={activeProject.inputs}
              onChange={updateActiveInputs}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
            />

            {/* 3. Results Gallery */}
            <Gallery
              images={activeProject.images}
              isGenerating={isGenerating}
              onRecreate={handleRecreate}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Chọn hoặc tạo dự án mới
          </div>
        )}
      </div>
      <ApiKeyModal onSave={() => window.location.reload()} />
    </div>
  );
}