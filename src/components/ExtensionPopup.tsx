import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Shield, Leaf, Users } from 'lucide-react';

// Brand interface matching the new data structure
interface Brand {
  name: string;
  categories: string[];
}

interface BrandData {
  categories: Record<string, { name: string; description: string }>;
  brands: Array<{
    name: string;
    variants: string[];
    categories: string[];
  }>;
}

const ExtensionPopup: React.FC = () => {
  const [enabledCategories, setEnabledCategories] = useState<string[]>(['BDS', 'Environmental', 'Labor']);
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(false);
  const [detectedBrands, setDetectedBrands] = useState<Brand[]>([]);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadEnabledCategories(),
          loadAutoScanSetting(),
          loadBrandData(),
          getDetectedBrands()
        ]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load enabled categories from storage
  const loadEnabledCategories = async () => {
    try {
      const result = await chrome.storage.local.get(['enabledCategories']);
      if (result.enabledCategories) {
        setEnabledCategories(result.enabledCategories);
      }
    } catch (error) {
      console.error('Failed to load enabled categories:', error);
    }
  };

  // Load auto scan setting from storage
  const loadAutoScanSetting = async () => {
    try {
      const result = await chrome.storage.local.get(['autoScanEnabled']);
      setAutoScanEnabled(result.autoScanEnabled || false);
    } catch (error) {
      console.error('Failed to load auto scan setting:', error);
    }
  };

  // Load brand data from JSON
  const loadBrandData = async () => {
    try {
      const response = await fetch(chrome.runtime.getURL('brandList.json'));
      const data = await response.json();
      setBrandData(data);
    } catch (error) {
      console.error('Failed to load brand data:', error);
    }
  };

  // Get detected brands from content script
  const getDetectedBrands = async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab.id) {
        const response = await chrome.tabs.sendMessage(activeTab.id, { type: 'get_detected_brands' });
        if (response && response.brands) {
          setDetectedBrands(response.brands);
        }
      }
    } catch (error) {
      console.error('Failed to get detected brands:', error);
    }
  };

  // Toggle category
  const toggleCategory = async (category: string) => {
    const newCategories = enabledCategories.includes(category)
      ? enabledCategories.filter(c => c !== category)
      : [...enabledCategories, category];
    
    setEnabledCategories(newCategories);
    
    try {
      await chrome.storage.local.set({ enabledCategories: newCategories });
      
      // Send message to content script
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab.id) {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'update_categories',
          categories: newCategories
        });
        
        // Refresh detected brands
        await getDetectedBrands();
      }
    } catch (error) {
      console.error('Failed to toggle category:', error);
    }
  };

  // Toggle auto scan
  const toggleAutoScan = async () => {
    const newAutoScan = !autoScanEnabled;
    setAutoScanEnabled(newAutoScan);
    
    try {
      await chrome.storage.local.set({ autoScanEnabled: newAutoScan });
      
      // Send message to content script
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab.id) {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'update_auto_scan',
          enabled: newAutoScan
        });
      }
    } catch (error) {
      console.error('Failed to toggle auto scan:', error);
    }
  };

  // Toggle highlighting
  const toggleHighlighting = async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab.id) {
        await chrome.tabs.sendMessage(activeTab.id, { type: 'toggle_highlighting' });
        setIsHighlighting(!isHighlighting);
        
        // Refresh detected brands after toggle
        setTimeout(async () => {
          await getDetectedBrands();
        }, 100);
      }
    } catch (error) {
      console.error('Failed to toggle highlighting:', error);
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colors = {
      BDS: 'bg-red-100 text-red-800 border-red-200',
      Environmental: 'bg-green-100 text-green-800 border-green-200',
      Labor: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons = {
      BDS: Shield,
      Environmental: Leaf,
      Labor: Users
    };
    const IconComponent = icons[category as keyof typeof icons];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  // Get detected brands for enabled categories
  const getDetectedBrandsForCategory = () => {
    return detectedBrands.filter(brand => 
      brand.categories.some(cat => enabledCategories.includes(cat))
    );
  };

  // Get brand count for category
  const getBrandCountForCategory = (category: string): number => {
    if (!brandData) return 0;
    return brandData.brands.filter(brand => 
      brand.categories.includes(category) && enabledCategories.includes(category)
    ).length;
  };

  if (isLoading) {
    return (
      <div className="w-80 h-96 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const visibleDetectedBrands = getDetectedBrandsForCategory();

  return (
    <div className="w-80 h-96 bg-background border border-border overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-card-foreground">Ethical Brand Scanner</h1>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            Free
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Controls */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-medium text-card-foreground">Controls</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-card-foreground">Auto Scan</label>
                <Switch checked={autoScanEnabled} onCheckedChange={toggleAutoScan} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-card-foreground">Manual Scan</label>
                <Button
                  onClick={toggleHighlighting}
                  variant={isHighlighting ? "destructive" : "default"}
                  size="sm"
                >
                  {isHighlighting ? 'Stop Scan' : 'Start Scan'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-medium text-card-foreground">Categories</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {['BDS', 'Environmental', 'Labor'].map((category) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <label className="text-sm font-medium text-card-foreground">{category}</label>
                    <Badge variant="outline" className="text-xs">
                      {getBrandCountForCategory(category)}
                    </Badge>
                  </div>
                  <Switch
                    checked={enabledCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Detected Brands */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-medium text-card-foreground">Detected Brands</h3>
            </CardHeader>
            <CardContent>
              {visibleDetectedBrands.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No flagged brands on this page</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleDetectedBrands.map((brand, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="flex items-center gap-2 p-2 rounded border border-border hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                      >
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-card-foreground flex-1">{brand.name}</span>
                        <div className="flex gap-1">
                          {brand.categories.map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className={`text-xs ${getCategoryColor(cat)}`}
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {selectedBrand === brand.name && brandData && (
                        <div className="ml-6 p-3 bg-muted rounded border">
                          <div className="space-y-2">
                            {brand.categories.map((cat) => {
                              const categoryInfo = brandData.categories[cat];
                              return (
                                <div key={cat} className="text-xs">
                                  <span className="font-medium text-foreground">{categoryInfo.name}:</span>
                                  <span className="text-muted-foreground ml-1">{categoryInfo.description}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPopup;