import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Shield, Leaf, Users, Scan, Zap, Eye, EyeOff, Settings, ExternalLink } from 'lucide-react';

// Brand interface matching the new data structure
interface Brand {
  name: string;
  categories: string[];
  placeholder?: string;
  links?: Array<{
    text: string;
    url: string;
  }>;
}

interface BrandData {
  categories: Record<string, { name: string; description: string }>;
  brands: Array<{
    name: string;
    variants: string[];
    categories: string[];
    placeholder?: string;
    links?: Array<{
      text: string;
      url: string;
    }>;
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
        console.log('Popup received response:', response);
        if (response && response.brands) {
          console.log('Setting detected brands:', response.brands);
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
      BDS: 'bg-red-900/20 text-red-300 border-red-700/30',
      Environmental: 'bg-emerald-900/20 text-emerald-300 border-emerald-700/30',
      Labor: 'bg-blue-900/20 text-blue-300 border-blue-700/30'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-900/20 text-gray-300 border-gray-700/30';
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
    const filtered = detectedBrands.filter(brand => 
      brand.categories.some(cat => enabledCategories.includes(cat))
    );
    console.log('Filtered detected brands:', filtered);
    return filtered;
  };

  // Get brand count for category
  const getBrandCountForCategory = (category: string): number => {
    if (!brandData) return 0;
    return brandData.brands.filter(brand => 
      brand.categories.includes(category) && enabledCategories.includes(category)
    ).length;
  };

  // Get unique brand description
  const getBrandDescription = (brand: Brand): string => {
    if (!brandData) return '';
    
    // Use placeholder text if available
    if (brand.placeholder) {
      return brand.placeholder;
    }
    
    const categoryDescriptions = brand.categories
      .filter(cat => enabledCategories.includes(cat))
      .map(cat => brandData.categories[cat].description);
    
    if (categoryDescriptions.length === 0) return '';
    if (categoryDescriptions.length === 1) return categoryDescriptions[0];
    
    // For multiple categories, create a combined description
    return `Issues: ${categoryDescriptions.join('; ')}`;
  };

  // Get brand links
  const getBrandLinks = (brand: Brand) => {
    return brand.links || [];
  };

  if (isLoading) {
    return (
      <div className="w-80 h-96 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-blue-400 mx-auto mb-3"></div>
          <p className="text-sm text-gray-300">Scanning page...</p>
        </div>
      </div>
    );
  }

  const visibleDetectedBrands = getDetectedBrandsForCategory();
  
  // Debug: Add test brands if none detected
  const testBrands = visibleDetectedBrands.length === 0 ? [
    {
      name: "Nestlé",
      categories: ["BDS", "Environmental"],
      placeholder: "Major water privatization and BDS violations in occupied territories",
      links: [
        {
          text: "Water privatization",
          url: "https://www.theguardian.com/global-development/2021/jul/28/nestle-water-privatization-bottled-water-business"
        },
        {
          text: "BDS violations",
          url: "https://bdsmovement.net/news/nestle-continues-operate-illegal-settlements"
        }
      ]
    }
  ] : [];
  
  const displayBrands = visibleDetectedBrands.length > 0 ? visibleDetectedBrands : testBrands;

  return (
    <div className="w-full h-full bg-gray-900 text-gray-100 flex flex-col overflow-hidden relative z-50">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10">
              <img src="/logo.png" alt="Logo" className="w-12 h-12" />
            </div>
            <span className="text-lg font-semibold">ClearLabel</span>
          </div>
          <Badge variant="secondary" className="bg-gray-700 text-gray-200 border-gray-600">
            Free
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="space-y-6">
          <div className="px-4 pt-4">            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">Auto scan on page load</p>
                  <p className="text-xs text-gray-400">Continuously monitor for brands</p>
                </div>
                <Switch checked={autoScanEnabled} onCheckedChange={toggleAutoScan} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">Manual scan mode</p>
                  <p className="text-xs text-gray-400">Highlight brands on demand</p>
                </div>
                <Button
                  onClick={toggleHighlighting}
                  variant={isHighlighting ? "destructive" : "outline"}
                  size="sm"
                  className="h-8 px-3 text-xs flex-shrink-0"
                >
                  {isHighlighting ? 'Stop' : 'Start'}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Detected Brands */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-100">Detected Brands</h3>
                {displayBrands.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {displayBrands.length}
                  </Badge>
                )}
            </div>
            
            {displayBrands.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300 mb-1">All clear!</p>
                <p className="text-xs text-gray-400">No flagged brands detected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayBrands.map((brand, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg border border-red-800/30 bg-red-900/10 hover:bg-red-900/20 cursor-pointer transition-colors"
                      onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{brand.name}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{getBrandDescription(brand)}</p>
                        <div className="flex gap-1 mt-2">
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
                        {getBrandLinks(brand).length > 0 && (
                          <div className="flex flex-col gap-1 mt-2">
                            {getBrandLinks(brand).map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                                title={link.url}
                              >
                                {link.text}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {selectedBrand === brand.name ? '−' : '+'}
                      </span>
                    </div>
                    
                    {selectedBrand === brand.name && brandData && (
                      <div className="ml-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700 relative z-10">
                        <div className="space-y-3">
                          <div className="text-xs">
                            <p className="text-gray-300 font-medium mb-2">Why this brand is flagged:</p>
                            <p className="text-gray-400 leading-relaxed">{getBrandDescription(brand)}</p>
                          </div>
                          {getBrandLinks(brand).length > 0 && (
                            <div className="text-xs">
                              <p className="text-gray-300 font-medium mb-2">Learn more:</p>
                              <div className="space-y-1">
                                {getBrandLinks(brand).map((link, index) => (
                                  <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-400 hover:text-blue-300 underline"
                                    title={link.url}
                                  >
                                    → {link.text}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="text-xs">
                            <p className="text-gray-300 font-medium mb-2">Categories:</p>
                            <div className="flex flex-wrap gap-1">
                              {brand.categories.map((cat) => {
                                const categoryInfo = brandData.categories[cat];
                                return (
                                  <div key={cat} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded">
                                    {getCategoryIcon(cat)}
                                    <span className="text-gray-200">{categoryInfo.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>



          <Separator className="bg-gray-800" />

          {/* Scan Categories */}
          <div className="px-4">
            <h3 className="font-semibold text-gray-100 mb-4">Scan Categories</h3>
            <div className="space-y-3">
              {['BDS', 'Environmental', 'Labor'].map((category) => (
                <div key={category} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-1.5 bg-gray-800 rounded-md flex-shrink-0">
                      {getCategoryIcon(category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-200 truncate">{category}</p>
                      <p className="text-xs text-gray-400 truncate">{getBrandCountForCategory(category)} brands</p>
                    </div>
                  </div>
                  <Switch
                    checked={enabledCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                    className="flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExtensionPopup;