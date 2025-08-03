import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, Settings, AlertTriangle } from 'lucide-react';

interface Brand {
  name: string;
  categories: string[];
}

const CATEGORIES = ['BDS', 'Environmental', 'Labor', 'Health', 'Privacy'];

const ExtensionPopup = () => {
  const [enabledCategories, setEnabledCategories] = useState<string[]>(CATEGORIES);
  const [detectedBrands, setDetectedBrands] = useState<string[]>([]);
  const [brandList, setBrandList] = useState<Brand[]>([]);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    Promise.all([
      loadEnabledCategories(),
      loadBrandList(),
      getDetectedBrands()
    ]).finally(() => setLoading(false));
  }, []);

  const loadEnabledCategories = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['enabledCategories']);
        const categories = result.enabledCategories || CATEGORIES;
        setEnabledCategories(categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBrandList = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response = await fetch(chrome.runtime.getURL('brandList.json'));
        const brands = await response.json();
        setBrandList(brands);
      }
    } catch (error) {
      console.error('Failed to load brand list:', error);
    }
  };

  const getDetectedBrands = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'get_detected_brands'
          });
          if (response?.brands) {
            setDetectedBrands(response.brands);
            setIsHighlighting(response.brands.length > 0);
          }
        }
      }
    } catch (error) {
      console.error('Failed to get detected brands:', error);
    }
  };

  const toggleCategory = async (category: string) => {
    const newCategories = enabledCategories.includes(category)
      ? enabledCategories.filter(c => c !== category)
      : [...enabledCategories, category];
    
    setEnabledCategories(newCategories);
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.tabs) {
        await chrome.storage.local.set({ enabledCategories: newCategories });
        
        // Update content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'update_categories',
            categories: newCategories
          });
        }
      }
    } catch (error) {
      console.error('Failed to update categories:', error);
    }
  };

  const toggleHighlighting = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'toggle_highlighting'
          });
          
          if (response?.success) {
            setIsHighlighting(!isHighlighting);
            // Refresh detected brands
            setTimeout(getDetectedBrands, 100);
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle highlighting:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'BDS': 'bg-destructive text-destructive-foreground',
      'Environmental': 'bg-success text-success-foreground',
      'Labor': 'bg-warning text-warning-foreground',
      'Health': 'bg-primary text-primary-foreground',
      'Privacy': 'bg-accent text-accent-foreground'
    };
    return colors[category] || 'bg-secondary text-secondary-foreground';
  };

  const getDetectedBrandsForCategory = () => {
    return detectedBrands.map(brandName => {
      const brand = brandList.find(b => b.name === brandName);
      return brand ? brand : { name: brandName, categories: [] };
    }).filter(brand => 
      brand.categories.some(category => enabledCategories.includes(category))
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background text-foreground p-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">Brand Scanner</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Scan and highlight brands on this page
        </p>
      </div>

      {/* Toggle Button */}
      <Button 
        onClick={toggleHighlighting}
        className="w-full"
        variant={isHighlighting ? "destructive" : "default"}
      >
        {isHighlighting ? (
          <>
            <EyeOff className="w-4 h-4 mr-2" />
            Stop Scanning
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-2" />
            Start Scanning
          </>
        )}
      </Button>

      <Separator />

      {/* Categories Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Categories
          </CardTitle>
          <CardDescription className="text-xs">
            Select which categories to highlight
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CATEGORIES.map(category => (
            <div key={category} className="flex items-center space-x-3">
              <Checkbox
                id={category}
                checked={enabledCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label 
                htmlFor={category}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {category}
              </label>
              <Badge 
                variant="outline" 
                className={`text-xs ${getCategoryColor(category)}`}
              >
                {brandList.filter(brand => 
                  brand.categories.includes(category)
                ).length}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detected Brands Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Detected Brands</CardTitle>
          <CardDescription className="text-xs">
            {getDetectedBrandsForCategory().length} brands found on this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            {getDetectedBrandsForCategory().length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                {isHighlighting ? 'No brands detected' : 'Click "Start Scanning" to detect brands'}
              </p>
            ) : (
              <div className="space-y-2">
                {getDetectedBrandsForCategory().map((brand, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <span className="text-sm font-medium">{brand.name}</span>
                    <div className="flex space-x-1">
                      {brand.categories
                        .filter(category => enabledCategories.includes(category))
                        .map(category => (
                          <Badge 
                            key={category} 
                            variant="outline"
                            className={`text-xs px-1 py-0 ${getCategoryColor(category)}`}
                          >
                            {category}
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensionPopup;