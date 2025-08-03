import { AlertTriangle, Download, Chrome, Eye, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Brand Scanner
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A Chrome extension that scans webpages for brand names and highlights them based on ethical categories like BDS, Environmental impact, Labor practices, and more.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="outline" className="bg-success text-success-foreground">Manifest V3</Badge>
            <Badge variant="outline" className="bg-primary text-primary-foreground">React</Badge>
            <Badge variant="outline" className="bg-accent text-accent-foreground">Local Data</Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-primary" />
                <span>Smart Detection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Scans visible text on any webpage to detect brand names from a curated local database.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Category Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Toggle highlighting for different categories: BDS, Environmental, Labor, Health, and Privacy concerns.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Chrome className="w-5 h-5 text-primary" />
                <span>Chrome Extension</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built with Manifest V3, React popup interface, and persistent user preferences via chrome.storage.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Installation Instructions */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-primary" />
              <span>Installation Instructions</span>
            </CardTitle>
            <CardDescription>
              How to install and use the Brand Scanner Chrome extension
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Development Setup</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                    <span>Build the extension: <code className="bg-muted px-2 py-1 rounded">npm run build:extension</code></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                    <span>Open Chrome and go to <code className="bg-muted px-2 py-1 rounded">chrome://extensions/</code></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                    <span>Enable "Developer mode" in the top right</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                    <span>Click "Load unpacked" and select the <code className="bg-muted px-2 py-1 rounded">dist</code> folder</span>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Usage</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                    <span>Navigate to any webpage</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                    <span>Click the Brand Scanner extension icon</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                    <span>Select categories to monitor</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                    <span>Click "Start Scanning" to highlight brands</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Categories Available:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-destructive text-destructive-foreground">BDS</Badge>
                <Badge className="bg-success text-success-foreground">Environmental</Badge>
                <Badge className="bg-warning text-warning-foreground">Labor</Badge>
                <Badge className="bg-primary text-primary-foreground">Health</Badge>
                <Badge className="bg-accent text-accent-foreground">Privacy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
