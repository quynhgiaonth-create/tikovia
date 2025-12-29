import React from 'react';
import { Plus, Layout, Package, Moon, Sun, Monitor } from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  isCompact: boolean;
  toggleTheme: () => void;
  isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  isCompact,
  toggleTheme,
  isDark
}) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        flex flex-col transition-all duration-300 ease-in-out h-full
        ${isCompact ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className={`p-4 flex items-center ${isCompact ? 'justify-center' : 'justify-between'}`}>
        {!isCompact && (
           <h1 className="font-bold text-xl text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
             <Monitor className="w-6 h-6 text-primary-600" />
             DesignGenius
           </h1>
        )}
        {isCompact && <Monitor className="w-8 h-8 text-primary-600" />}
      </div>

      {/* New Project Action */}
      <div className="p-3">
        <button
          onClick={onCreateProject}
          className={`
            w-full flex items-center justify-center gap-2 
            bg-primary-600 hover:bg-primary-700 text-white 
            p-3 rounded-xl shadow-lg shadow-primary-500/20 transition-all
            ${isCompact ? 'aspect-square p-0' : ''}
          `}
          title="Tạo dự án mới"
        >
          <Plus className="w-5 h-5" />
          {!isCompact && <span className="font-medium">Dự án mới</span>}
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {!isCompact && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Dự án</div>}
        
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors
              ${activeProjectId === project.id 
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
              ${isCompact ? 'justify-center' : ''}
            `}
          >
            <Layout className="w-5 h-5 flex-shrink-0" />
            {!isCompact && (
              <div className="flex-1 text-left truncate">
                <div className="font-medium truncate">{project.name}</div>
                <div className="text-xs opacity-70">
                  {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer / Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className={`
            w-full flex items-center gap-3 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
            ${isCompact ? 'justify-center' : ''}
          `}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!isCompact && <span className="text-sm font-medium">{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</span>}
        </button>
      </div>
    </div>
  );
};