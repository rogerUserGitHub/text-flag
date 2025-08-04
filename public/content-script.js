// Content script for Ethical Brand Scanner extension
(function() {
  let brandData = null;
  let enabledCategories = [];
  let detectedBrands = [];
  let isHighlighting = false;
  let autoScanEnabled = false;

  // Load brand data from JSON file
  async function loadBrandData() {
    try {
      const response = await fetch(chrome.runtime.getURL('brandList.json'));
      brandData = await response.json();
    } catch (error) {
      console.error('Failed to load brand data:', error);
    }
  }

  // Load enabled categories from storage
  async function loadEnabledCategories() {
    try {
      const result = await chrome.storage.local.get(['enabledCategories']);
      enabledCategories = result.enabledCategories || ['BDS', 'Environmental', 'Labor'];
    } catch (error) {
      console.error('Failed to load enabled categories:', error);
      enabledCategories = ['BDS', 'Environmental', 'Labor'];
    }
  }

  // Load auto scan setting from storage
  async function loadAutoScanSetting() {
    try {
      const result = await chrome.storage.local.get(['autoScanEnabled']);
      autoScanEnabled = result.autoScanEnabled || false;
    } catch (error) {
      console.error('Failed to load auto scan setting:', error);
      autoScanEnabled = false;
    }
  }

  // Remove existing highlights
  function removeHighlights() {
    const highlightedElements = document.querySelectorAll('.brand-flagged');
    highlightedElements.forEach(element => {
      const parent = element.parentNode;
      parent.replaceChild(document.createTextNode(element.textContent), element);
      parent.normalize();
    });
    isHighlighting = false;
    detectedBrands = [];
  }

  // Get visible text elements
  function getVisibleTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Skip script, style, and already flagged elements
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          if (parent.classList.contains('brand-flagged')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Check if element is visible
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Check if text node has meaningful content
          if (node.textContent.trim().length === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    return textNodes;
  }

  // Function to highlight brands on the page
  function highlightBrands() {
    if (isHighlighting) {
      removeHighlights();
      isHighlighting = false;
      return;
    }

    if (!brandData || !brandData.brands || brandData.brands.length === 0) {
      console.warn('Brand data not loaded');
      return;
    }

    detectedBrands = [];
    const textNodes = getVisibleTextNodes(document.body);
    
    textNodes.forEach(node => {
      let text = node.textContent;
      let hasMatch = false;
      
      brandData.brands.forEach(brand => {
        // Check if brand has any enabled categories
        const hasEnabledCategory = brand.categories.some(category => 
          enabledCategories.includes(category)
        );
        
        if (!hasEnabledCategory) return;
        
        // Check all variants of the brand name
        brand.variants.forEach(variant => {
          // Create case-insensitive regex for variant
          const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          
          if (regex.test(text)) {
            hasMatch = true;
            
            // Add to detected brands if not already present
            if (!detectedBrands.find(db => db.name === brand.name)) {
              detectedBrands.push({
                name: brand.name,
                categories: brand.categories.filter(cat => enabledCategories.includes(cat)),
                placeholder: brand.placeholder,
                links: brand.links
              });
            }
            
            // Replace matches with highlighted spans
            text = text.replace(regex, (match) => {
              const enabledCats = brand.categories.filter(cat => enabledCategories.includes(cat));
              const categoryDescriptions = enabledCats.map(cat => {
                const categoryInfo = brandData.categories[cat];
                return `${categoryInfo.name} — ${categoryInfo.description}`;
              });
              const tooltip = `⚠️ Flagged: ${categoryDescriptions.join(' | ')}`;
              return `<span class="brand-flagged" data-tooltip="${tooltip}">${match}</span>`;
            });
          }
        });
      });
      
      if (hasMatch) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = text;
        
        // Replace the text node with the highlighted content
        const parent = node.parentNode;
        while (wrapper.firstChild) {
          parent.insertBefore(wrapper.firstChild, node);
        }
        parent.removeChild(node);
      }
    });

    isHighlighting = true;
    
    // Send detected brands to popup
    chrome.runtime.sendMessage({
      type: 'brands_detected',
      brands: detectedBrands
    }).catch(() => {
      // Popup might not be open, ignore error
    });
  }

  // Initialize the extension
  async function initialize() {
    await loadBrandData();
    await loadEnabledCategories();
    await loadAutoScanSetting();
    
    // Auto scan if enabled
    if (autoScanEnabled) {
      // Wait a bit for the page to fully load
      setTimeout(() => {
        highlightBrands();
      }, 1000);
    }
  }

  initialize();

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'toggle_highlighting':
        highlightBrands();
        sendResponse({ success: true });
        break;
        
      case 'update_categories':
        enabledCategories = message.categories;
        if (isHighlighting) {
          removeHighlights();
          isHighlighting = false;
          highlightBrands();
        }
        sendResponse({ success: true });
        break;
        
      case 'update_auto_scan':
        autoScanEnabled = message.enabled;
        sendResponse({ success: true });
        break;
        
      case 'get_detected_brands':
        console.log('Content script sending detected brands:', detectedBrands);
        sendResponse({ brands: detectedBrands });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  });
})();