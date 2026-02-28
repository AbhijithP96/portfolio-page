// smoothscroll-fixed.js - Complete Solution for Click-to-Scroll Issue
// This version fixes the clicking issue while maintaining scroll highlighting

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 SMOOTH SCROLL: Click-to-Scroll FIXED Version Loading...');
  
  // Configuration
  const CONFIG = {
    headerOffset: 80,        // Adjust based on your header height
    highlightOffset: 150,    // When to trigger highlighting during scroll
    debugMode: true          // Set to false to disable console logging
  };

  // State tracking
  let scrollEventCount = 0;
  let highlightUpdateCount = 0;
  let clickEventCount = 0;
  
  // Find navigation links with multiple strategies
  let navLinks = [];
  let sections = [];

  // Strategy 1: Look for header nav links
  navLinks = document.querySelectorAll('header nav a[href^="#"]');
  if (navLinks.length === 0) {
    // Strategy 2: Look for any header links starting with #
    navLinks = document.querySelectorAll('header a[href^="#"]');
  }
  if (navLinks.length === 0) {
    // Strategy 3: Look for any links starting with #
    navLinks = document.querySelectorAll('a[href^="#"]');
  }

  if (CONFIG.debugMode) {
    console.log(`✅ Found ${navLinks.length} navigation links`);
  }

  // Link sections to navigation
  navLinks.forEach((link, index) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const sectionId = href.substring(1);
      const section = document.getElementById(sectionId);
      
      if (section) {
        sections.push(section);
        if (CONFIG.debugMode) {
          console.log(`  ✅ Section "${sectionId}" linked to nav ${index}`);
        }
      } else if (CONFIG.debugMode) {
        console.log(`  ❌ Section "${sectionId}" NOT FOUND`);
      }
    }
  });

  if (CONFIG.debugMode) {
    console.log(`📊 Summary: ${sections.length} sections successfully linked`);
  }

  // CLICK-TO-SCROLL FUNCTIONALITY - Multiple approaches for maximum compatibility
  navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      clickEventCount++;
      const targetHref = link.getAttribute('href');
      
      if (CONFIG.debugMode) {
        console.log(`🖱️ CLICK EVENT #${clickEventCount}: ${targetHref}`);
      }

      if (targetHref && targetHref.startsWith('#')) {
        const sectionId = targetHref.substring(1);
        const targetSection = document.getElementById(sectionId);
        
        if (targetSection) {
          // Prevent default ONLY when we have a valid target
          e.preventDefault();
          
          if (CONFIG.debugMode) {
            console.log(`  🎯 Target section found: ${sectionId}`);
          }

          // METHOD 1: Try modern scrollIntoView first
          try {
            targetSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
            
            if (CONFIG.debugMode) {
              console.log(`  ✅ scrollIntoView method used`);
            }
            
            // Update highlight immediately
            setTimeout(() => {
              updateHighlighting();
            }, 100);
            
          } catch (scrollError) {
            if (CONFIG.debugMode) {
              console.log(`  ⚠️ scrollIntoView failed, trying fallback methods`);
            }
            
            // METHOD 2: Calculate position manually
            let targetPosition = 0;
            try {
              // Try getBoundingClientRect for more accurate positioning
              const rect = targetSection.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              targetPosition = rect.top + scrollTop - CONFIG.headerOffset;
              
              if (CONFIG.debugMode) {
                console.log(`  📍 Calculated position: ${targetPosition}px (rect method)`);
              }
            } catch (rectError) {
              // METHOD 3: Fallback to offsetTop
              targetPosition = targetSection.offsetTop - CONFIG.headerOffset;
              
              if (CONFIG.debugMode) {
                console.log(`  📍 Calculated position: ${targetPosition}px (offsetTop method)`);
              }
            }

            // Try window.scrollTo with smooth behavior
            try {
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
              
              if (CONFIG.debugMode) {
                console.log(`  ✅ window.scrollTo method used`);
              }
            } catch (windowScrollError) {
              // METHOD 4: Last resort - instant scroll
              window.scrollTo(0, targetPosition);
              
              if (CONFIG.debugMode) {
                console.log(`  ⚠️ Using instant scroll as last resort`);
              }
            }
            
            // Update highlight after scroll
            setTimeout(() => {
              updateHighlighting();
            }, 300);
          }
          
        } else if (CONFIG.debugMode) {
          console.log(`  ❌ Target section "${sectionId}" not found`);
        }
      }
    });
  });

  // SCROLL HIGHLIGHTING FUNCTIONALITY
  function updateHighlighting() {
    if (sections.length === 0) return;
    
    highlightUpdateCount++;
    
    // Calculate which section is currently most visible
    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;
    const triggerPoint = scrollPosition + CONFIG.highlightOffset;
    
    let activeIndex = 0;
    let bestScore = Infinity;
    
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const absoluteTop = rect.top + scrollPosition;
      const distance = Math.abs(triggerPoint - absoluteTop);
      
      if (distance < bestScore) {
        bestScore = distance;
        activeIndex = index;
      }
    });
    
    // Apply highlighting
    navLinks.forEach((link, index) => {
      if (index === activeIndex) {
        // Active link styling
        link.style.borderBottom = '2px solid #ffffff';
        link.style.paddingBottom = '4px';
        link.style.transition = 'all 0.3s ease';
        link.style.opacity = '1';
      } else {
        // Inactive link styling
        link.style.borderBottom = 'none';
        link.style.paddingBottom = '0';
        link.style.transition = 'all 0.3s ease';
        link.style.opacity = '0.7';
      }
    });

    if (CONFIG.debugMode && highlightUpdateCount % 10 === 0) {
      const activeSection = sections[activeIndex];
      console.log(`🎯 ACTIVE SECTION: "${activeSection.id}" (scroll: ${scrollPosition}px)`);
    }
  }

  // Attach scroll event listeners with throttling
  let scrollTimeout;
  const throttledHighlightUpdate = () => {
    scrollEventCount++;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateHighlighting, 16); // ~60fps
  };

  // Multiple scroll event strategies for maximum compatibility
  window.addEventListener('scroll', throttledHighlightUpdate, { passive: true });
  document.addEventListener('scroll', throttledHighlightUpdate, { passive: true });
  
  // Fallback: Interval-based detection for problematic browsers
  setInterval(() => {
    updateHighlighting();
  }, 100);

  // Initial highlighting
  setTimeout(() => {
    updateHighlighting();
  }, 500);

  // Debug stats (remove in production)
  if (CONFIG.debugMode) {
    setInterval(() => {
      console.log(`📊 STATS: ${scrollEventCount} scroll events, ${highlightUpdateCount} highlights, ${clickEventCount} clicks`);
    }, 5000);
    
    // Make debug functions globally available
    window.testClickScroll = (sectionId) => {
      const section = document.getElementById(sectionId || 'about');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log(`🧪 TEST: Scrolled to ${sectionId || 'about'}`);
      }
    };
    
    window.debugScrollStats = () => {
      console.log({
        navLinks: navLinks.length,
        sections: sections.length,
        scrollEvents: scrollEventCount,
        highlights: highlightUpdateCount,
        clicks: clickEventCount
      });
    };
  }

  console.log('✅ Smooth scroll with click-to-scroll fix fully initialized');
});