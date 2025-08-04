import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Shield, Leaf, Users, Scan, Zap, Eye, EyeOff } from 'lucide-react';

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
      BDS: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      Environmental: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      Labor: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
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
      <div className="w-80 h-96 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-sm font-medium text-slate-600">Scanning page...</p>
        </div>
      </div>
    );
  }

  const visibleDetectedBrands = getDetectedBrandsForCategory();

  return (
    <div className="w-80 h-96 bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200/50 overflow-hidden flex flex-col shadow-xl">
      {/* Header with gradient */}
      <div className="relative p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo space */}
            <div className="w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Ethical ScannerXX</h1>
              <p className="text-xs text-blue-100">Brand transparency tool</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            Free
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white/50 backdrop-blur-sm">
        <div className="p-4 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">Auto Scan</p>
                      <p className="text-xs text-slate-500">Continuous</p>
                    </div>
                  </div>
                  <Switch checked={autoScanEnabled} onCheckedChange={toggleAutoScan} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all duration-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-md">
                      {isHighlighting ? (
                        <EyeOff className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">Manual Scan</p>
                      <p className="text-xs text-slate-500">On-demand</p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleHighlighting}
                    variant={isHighlighting ? "destructive" : "default"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    {isHighlighting ? 'Stop' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-md">
                  <Scan className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Scan Categories</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {['BDS', 'Environmental', 'Labor'].map((category) => (
                <div key={category} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 rounded-md">
                      {getCategoryIcon(category)}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">{category}</label>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-xs bg-white/50">
                          {getBrandCountForCategory(category)} brands
                        </Badge>
                      </div>
                    </div>
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
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Detected Brands</h3>
                {visibleDetectedBrands.length > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {visibleDetectedBrands.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {visibleDetectedBrands.length === 0 ? (
                <div className="text-center py-6">
                  <div className="relative mb-3">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20"></div>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">All clear!</p>
                  <p className="text-xs text-slate-500">No flagged brands detected on this page</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleDetectedBrands.map((brand, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 cursor-pointer transition-all duration-200 group"
                        onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                      >
                        <div className="p-1.5 bg-red-100 rounded-md group-hover:bg-red-200 transition-colors">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-800 truncate block">{brand.name}</span>
                          <div className="flex gap-1 mt-1">
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
                        <div className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                          {selectedBrand === brand.name ? '−' : '+'}
                        </div>
                      </div>
                      
                      {selectedBrand === brand.name && brandData && (
                        <div className="ml-6 p-4 bg-slate-50/80 rounded-lg border border-slate-200">
                          <div className="space-y-3">
                            {brand.categories.map((cat) => {
                              const categoryInfo = brandData.categories[cat];
                              return (
                                <div key={cat} className="text-xs">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getCategoryIcon(cat)}
                                    <span className="font-semibold text-slate-800">{categoryInfo.name}</span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed ml-6">{categoryInfo.description}</p>
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