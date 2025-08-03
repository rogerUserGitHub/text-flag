// Content script for Brand Scanner extension
(function() {
  let brandList = [];
  let enabledCategories = [];
  let isHighlighting = false;

  // Load brand list from local file
  async function loadBrandList() {
    try {
      const response = await fetch(chrome.runtime.getURL('brandList.json'));
      brandList = await response.json();
    } catch (error) {
      console.error('Failed to load brand list:', error);
    }
  }

  // Load enabled categories from storage
  async function loadEnabledCategories() {
    try {
      const result = await chrome.storage.local.get(['enabledCategories']);
      enabledCategories = result.enabledCategories || ['BDS', 'Environmental', 'Labor', 'Health', 'Privacy'];
    } catch (error) {
      console.error('Failed to load enabled categories:', error);
      enabledCategories = ['BDS', 'Environmental', 'Labor', 'Health', 'Privacy'];
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

  // Highlight brands in text
  function highlightBrands() {
    if (isHighlighting) {
      removeHighlights();
      return;
    }

    const textNodes = getVisibleTextNodes(document.body);
    const detectedBrands = new Set();

    textNodes.forEach(textNode => {
      let text = textNode.textContent;
      let hasChanges = false;
      let newHTML = '';
      let lastIndex = 0;

      // Create a regex for all brands with enabled categories
      const relevantBrands = brandList.filter(brand => 
        brand.categories.some(category => enabledCategories.includes(category))
      );

      if (relevantBrands.length === 0) return;

      // Sort brands by length (longest first) to avoid partial matches
      relevantBrands.sort((a, b) => b.name.length - a.name.length);

      relevantBrands.forEach(brand => {
        const regex = new RegExp(`\\b${brand.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'gi');
        let match;

        while ((match = regex.exec(text)) !== null) {
          // Check if this match overlaps with previous matches
          if (match.index >= lastIndex) {
            const enabledCategoriesForBrand = brand.categories.filter(cat => enabledCategories.includes(cat));
            
            if (enabledCategoriesForBrand.length > 0) {
              detectedBrands.add(brand.name);
              
              // Add text before the match
              newHTML += text.substring(lastIndex, match.index);
              
              // Add highlighted brand
              const tooltip = `⚠️ Flagged for: ${enabledCategoriesForBrand.join(', ')}`;
              newHTML += `<span class="brand-flagged" data-tooltip="${tooltip}">${match[0]}</span>`;
              
              lastIndex = match.index + match[0].length;
              hasChanges = true;
            }
          }
        }
      });

      if (hasChanges) {
        // Add remaining text
        newHTML += text.substring(lastIndex);
        
        // Create a new element to replace the text node
        const wrapper = document.createElement('span');
        wrapper.innerHTML = newHTML;
        
        // Replace the text node with the wrapper's contents
        const parent = textNode.parentNode;
        while (wrapper.firstChild) {
          parent.insertBefore(wrapper.firstChild, textNode);
        }
        parent.removeChild(textNode);
      }
    });

    isHighlighting = true;

    // Send detected brands to popup
    chrome.runtime.sendMessage({
      type: 'brands_detected',
      brands: Array.from(detectedBrands)
    });
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'toggle_highlighting') {
      loadEnabledCategories().then(() => {
        highlightBrands();
        sendResponse({ success: true });
      });
    } else if (message.type === 'update_categories') {
      enabledCategories = message.categories;
      if (isHighlighting) {
        removeHighlights();
        highlightBrands();
      }
      sendResponse({ success: true });
    } else if (message.type === 'get_detected_brands') {
      // Return currently detected brands
      const highlightedElements = document.querySelectorAll('.brand-flagged');
      const detectedBrands = Array.from(new Set(Array.from(highlightedElements).map(el => el.textContent)));
      sendResponse({ brands: detectedBrands });
    }
  });

  // Initialize
  loadBrandList();
  loadEnabledCategories();
})();