import { promises as fs } from 'fs';
import { join } from 'path';

// Component template based on home-robot.tsx
const createSplineComponentTemplate = (componentName: string, splineUrl: string) => {
  const pascalCaseName = componentName
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  return `import { memo, useRef, useEffect } from "react";

interface ${pascalCaseName}Props {
  className?: string;
}

export const ${pascalCaseName} = memo(function ${pascalCaseName}({ className = "" }: ${pascalCaseName}Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let Application: any;
    let app: any;

    async function init() {
      if (!canvasRef.current) return;

      try {
        // Dynamically import the Spline runtime ES module from CDN
        // @ts-ignore - Dynamic import from CDN
        const module = await import('https://unpkg.com/@splinetool/runtime@1.10.51/build/runtime.js');
        Application = module.Application;

        // Initialize the 3D app on the canvas
        app = new Application(canvasRef.current);

        // Load the Spline scene for ${componentName}
        await app.load('${splineUrl}');

        appRef.current = app;
      } catch (error) {
        console.error('Failed to load ${componentName} Spline scene:', error);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy();
        } catch (error) {
          console.error('Error destroying ${componentName} Spline app:', error);
        }
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={\`relative overflow-hidden rounded-2xl w-full h-64 sm:h-80 md:h-96 lg:h-[500px] \${className}\`}
    >
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

  getComponentImportPath(eventName: string): string {
    const sanitizedName = this.sanitizeComponentName(eventName);
    return `@/components/generated/${sanitizedName}`;
  }

  getComponentName(eventName: string): string {
    return this.getPascalCase(eventName);
  }
}

export const componentGenerator = new ComponentGenerator();