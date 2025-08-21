import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">EmpCon</h1>
          <p className="text-xl text-muted-foreground">Employee Management System</p>
        </div>

        {/* Component Showcase */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button styles and variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields and labels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" />
              </div>
            </CardContent>
          </Card>

          {/* Theme Test */}
          <Card>
            <CardHeader>
              <CardTitle>Color System</CardTitle>
              <CardDescription>Testing CSS variables and theming</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="w-full h-8 bg-primary rounded flex items-center justify-center text-primary-foreground">Primary</div>
                  <div className="w-full h-8 bg-secondary rounded flex items-center justify-center text-secondary-foreground">Secondary</div>
                  <div className="w-full h-8 bg-muted rounded flex items-center justify-center text-muted-foreground">Muted</div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-8 bg-accent rounded flex items-center justify-center text-accent-foreground">Accent</div>
                  <div className="w-full h-8 bg-destructive rounded flex items-center justify-center text-destructive-foreground">Destructive</div>
                  <div className="w-full h-8 bg-card border rounded flex items-center justify-center text-card-foreground">Card</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Status</CardTitle>
              <CardDescription>Phase 1 Week 1 progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Next.js 15.5.0 with App Router</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Tailwind CSS 4 with CSS Variables</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>shadcn/ui Components</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Type Safety with TypeScript</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Ready for Phase 1 Week 2: RBAC, Login Page, and Navigation</p>
        </div>
      </div>
    </div>
  );
}
