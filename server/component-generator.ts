import { promises as fs } from 'fs';
import { join } from 'path';

// Component template based on home-robot.tsx with improved error handling
const createSplineComponentTemplate = (componentName: string, splineUrl: string) => {
  const pascalCaseName = componentName
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  return `import { memo, useRef, useEffect, useState } from "react";
import { createSplineApp } from "@/lib/spline-loader";

interface ${pascalCaseName}Props {
  className?: string;
}

export const ${pascalCaseName} = memo(function ${pascalCaseName}({ className = "" }: ${pascalCaseName}Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let app: any;
    let canceled = false;

    async function init() {
      if (!canvasRef.current || canceled) return;

      // Wait for canvas to have proper dimensions
      const waitForCanvasSize = () => {
        return new Promise<void>((resolve) => {
          const checkSize = () => {
            if (canvasRef.current && !canceled) {
              const rect = canvasRef.current.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                resolve();
              } else {
                requestAnimationFrame(checkSize);
              }
            } else {
              resolve();
            }
          };
          checkSize();
        });
      };

      try {
        setIsLoading(true);
        setError(null);
        
        await waitForCanvasSize();
        
        if (!canvasRef.current || canceled) return;

        // Use shared Spline runtime loader
        app = await createSplineApp(canvasRef.current, 1.75);

        if (canceled) {
          app.destroy?.();
          return;
        }

        // Load the Spline scene for ${componentName}
        await app.load('${splineUrl}');

        if (!canceled) {
          appRef.current = app;
          setIsLoading(false);
        } else {
          app.destroy?.();
        }
      } catch (error) {
        console.error('Failed to load ${componentName} Spline scene:', error);
        setError(error instanceof Error ? error.message : 'Failed to load 3D scene');
        setIsLoading(false);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      canceled = true;
      if (appRef.current) {
        try {
          appRef.current.destroy?.();
        } catch (error) {
          console.warn('Error destroying ${componentName} Spline app:', error);
        }
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={\`relative overflow-hidden rounded-2xl w-full h-64 sm:h-80 md:h-96 lg:h-[500px] \${className}\`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading 3D scene...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-2xl">
          <div className="text-center p-4">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">Failed to load 3D scene</p>
            <p className="text-xs text-red-500 dark:text-red-500">{error}</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full block outline-none"
        style={{
          background: 'transparent',
          display: 'block',
        }}
      />
    </div>
  );
});
`;
};

export class ComponentGenerator {
  private componentsDir = join(process.cwd(), 'client', 'src', 'components', 'generated');

  async ensureComponentsDir() {
    try {
      await fs.access(this.componentsDir);
    } catch {
      await fs.mkdir(this.componentsDir, { recursive: true });
    }
  }

  sanitizeComponentName(eventName: string): string {
    return eventName
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  getPascalCase(eventName: string): string {
    return eventName
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  async createSplineComponent(eventName: string, splineUrl: string): Promise<string> {
    if (!splineUrl) {
      throw new Error('Spline URL is required to create component');
    }

    await this.ensureComponentsDir();

    const sanitizedName = this.sanitizeComponentName(eventName);
    const componentContent = createSplineComponentTemplate(eventName, splineUrl);
    const filePath = join(this.componentsDir, `${sanitizedName}.tsx`);

    await fs.writeFile(filePath, componentContent, 'utf-8');
    
    console.log(`Created Spline component: ${filePath}`);
    return filePath;
  }

  async deleteSplineComponent(eventName: string): Promise<boolean> {
    const sanitizedName = this.sanitizeComponentName(eventName);
    const filePath = join(this.componentsDir, `${sanitizedName}.tsx`);

    try {
      await fs.unlink(filePath);
      console.log(`Deleted Spline component: ${filePath}`);
      return true;
    } catch (error) {
      console.warn(`Could not delete component file: ${filePath}`, error);
      return false;
    }
  }

  async componentExists(eventName: string): Promise<boolean> {
    const sanitizedName = this.sanitizeComponentName(eventName);
    const filePath = join(this.componentsDir, `${sanitizedName}.tsx`);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async updateSplineComponent(eventName: string, splineUrl: string): Promise<string> {
    // For updates, we just recreate the component with the new URL
    return await this.createSplineComponent(eventName, splineUrl);
  }

  async regenerateComponent(eventName: string, splineUrl: string): Promise<string> {
    // Regenerate component with latest template
    const sanitizedName = this.sanitizeComponentName(eventName);
    const filePath = join(this.componentsDir, `${sanitizedName}.tsx`);
    
    // Check if component exists
    try {
      await fs.access(filePath);
      console.log(`Regenerating component: ${filePath}`);
    } catch {
      console.log(`Component doesn't exist, creating new one: ${filePath}`);
    }
    
    return await this.createSplineComponent(eventName, splineUrl);
  }

  getComponentImportPath(eventName: string): string {
    const sanitizedName = this.sanitizeComponentName(eventName);
    return `@/components/generated/${sanitizedName}`;
  }

  async regenerateAllComponents(events: Array<{name: string, spline_right_url: string}>): Promise<string[]> {
    const results: string[] = [];
    
    for (const event of events) {
      if (event.spline_right_url) {
        try {
          const result = await this.regenerateComponent(event.name, event.spline_right_url);
          results.push(result);
        } catch (error) {
          console.error(`Failed to regenerate component for ${event.name}:`, error);
        }
      }
    }
    
    return results;
  }

  getComponentName(eventName: string): string {
    return this.getPascalCase(eventName);
  }
}

export const componentGenerator = new ComponentGenerator();