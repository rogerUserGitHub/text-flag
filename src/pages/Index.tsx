import {
  Shield,
  Download,
  Chrome,
  Eye,
  Settings,
  CheckCircle,
  Leaf,
  Users,
  Zap,
  Globe,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center justify-center space-x-3">
            <img src="/logo.png" className="w-16 h-16 text-primary" />
            <div className="text-left">
              <div>ClearLabel</div>
              <div className="text-4xl text-gray-600">
                Your Ethical Brand Scanner
              </div>
            </div>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A powerful Chrome extension that helps you make ethical purchasing
            decisions by scanning webpages and highlighting brands based on
            their BDS status, environmental impact, and labor practices.
          </p>
          <div className="flex items-center justify-center space-x-3 flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1"
            >
              Free Forever
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Manifest V3
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              React + TypeScript
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Privacy First
            </Badge>
          </div>
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-center space-x-4 flex-wrap gap-2">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => {
                  // Scroll to installation instructions
                  document.getElementById('installation')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                Get Extension
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => {
                  window.open(
                    'https://github.com/rogerUserGitHub/text-flag',
                    '_blank'
                  );
                }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View Source
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Currently in development/under Google review - view source code on
              GitHub or follow installation instructions below
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Zap className="w-6 h-6 text-yellow-500" />
                <span>Auto Scan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Automatically scan pages when they load. Set it once and forget
                it.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Eye className="w-6 h-6 text-blue-500" />
                <span>Smart Detection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Detects brand variants and aliases for comprehensive coverage.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Settings className="w-6 h-6 text-gray-500" />
                <span>Customizable</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Choose which categories matter to you and toggle them on/off.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Globe className="w-6 h-6 text-green-500" />
                <span>Privacy Focused</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                All data is stored locally. No tracking, no external servers.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Categories Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Ethical Categories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We track brands across three main ethical categories, each with
              detailed explanations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Shield className="w-7 h-7 text-red-600" />
                  <span className="text-red-800">BDS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-red-700 leading-relaxed">
                  Companies that support or operate in occupied territories,
                  violating international law. Part of the Boycott, Divestment,
                  Sanctions movement.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Leaf className="w-7 h-7 text-green-600" />
                  <span className="text-green-800">Environmental</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-green-700 leading-relaxed">
                  Companies with poor environmental practices, significant
                  pollution records, or climate change denial.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Users className="w-7 h-7 text-blue-600" />
                  <span className="text-blue-800">Labor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-blue-700 leading-relaxed">
                  Companies with documented poor labor conditions, worker
                  exploitation, or union suppression practices.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Installation Instructions */}
        <Card id="installation" className="max-w-5xl mx-auto border-2">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-3 text-2xl">
              <Chrome className="w-8 h-8 text-primary" />
              <span>Installation & Setup</span>
            </CardTitle>
            <CardDescription className="text-lg">
              Get started with the Ethical Brand Scanner in just a few steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <Download className="w-5 h-5 text-primary" />
                  <span>Development Setup</span>
                </h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start space-x-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Build the extension</p>
                      <code className="bg-muted px-3 py-1 rounded text-xs block mt-1">
                        npm run build:extension
                      </code>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <div>
                      <p className="font-medium">Open Chrome extensions</p>
                      <code className="bg-muted px-3 py-1 rounded text-xs block mt-1">
                        chrome://extensions/
                      </code>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <p>Enable "Developer mode" toggle in the top right</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <div>
                      <p className="font-medium">Load the extension</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Click "Load unpacked" and select the{' '}
                        <code className="bg-muted px-1 rounded">dist</code>{' '}
                        folder
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <span>Usage Guide</span>
                </h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start space-x-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <p>Navigate to any shopping or news website</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <p>Click the Ethical Brand Scanner extension icon</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <p>Toggle "Auto Scan" for automatic detection</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <p>Select ethical categories that matter to you</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      5
                    </span>
                    <p>View flagged brands with detailed explanations</p>
                  </li>
                </ol>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
              <h4 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>What You'll See</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    BDS
                  </Badge>
                  <span className="text-sm">Boycott flags</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Environmental
                  </Badge>
                  <span className="text-sm">Eco concerns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Labor
                  </Badge>
                  <span className="text-sm">Worker issues</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Brands are highlighted directly on the page with detailed
                tooltips explaining why they're flagged.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-20 pt-8 border-t">
          <div className="flex justify-center space-x-6 mb-4">
            <a
              href="https://github.com/rogerUserGitHub/text-flag"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>View on GitHub</span>
            </a>
            <a
              href="/PRIVACY_POLICY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/TERMS_OF_SERVICE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
          <p className="text-muted-foreground">
            Built with React, TypeScript, and Tailwind CSS •
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
