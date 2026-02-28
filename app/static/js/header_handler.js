/**
 * Complete Mobile Header Handler - Fixed for All Viewports
 * 
 * This script converts the existing header/navigation into a slide-in drawer
 * that actually works. Fixes all the issues preventing the drawer from showing.
 * 
 * COMPLETE FEATURES:
 * - All methods implemented (createDrawer, showDrawer, hideDrawer, etc.)
 * - No HTML entity encoding issues
 * - Proper event handling
 * - Debug logging to troubleshoot issues
 * - Works on all viewport sizes
 */

class MobileHeaderHandler {
  constructor(options = {}) {
    this.options = {
      // Enhanced breakpoints
      mobileBreakpoint: 900,
      smallMobileBreakpoint: 540,
      headerSelectors: [
        'header', '.header', '#header', 'nav', '.nav', '.navigation', 
        '.navbar', '.top-nav', '.header-nav', '.main-nav'
      ],
      animationDuration: 300,
      slideFromTop: true,
      // Hamburger button settings
      hamburgerColor: '#fff',
      hamburgerBackground: '#333',
      hamburgerSize: '40px',
      // Drawer settings
      drawerHeight: '60vh',
      drawerBackground: 'rgba(33, 33, 33, 0.95)',
      backdropColor: 'rgba(0, 0, 0, 0.5)',
      debugMode: true,
      autoInit: true,
      ...options
    };

    this.header = null;
    this.hamburgerButton = null;
    this.drawer = null;
    this.backdrop = null;
    this.isOpen = false;
    this.isMobile = false;
    this.isSmallMobile = false;

    if (this.options.autoInit) {
      this.init();
    }
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.log('🚀 Initializing Mobile Header Handler...');
    this.checkMobile();
    
    if (this.isMobile) {
      this.findHeader();
      if (this.header) {
        this.createHamburgerButton();
        this.createDrawer();
        this.setupEventListeners();
        this.hideOriginalHeader();
        this.log('✅ Mobile header system created successfully!');
      } else {
        this.log('❌ No header element found. Checking selectors...');
        this.options.headerSelectors.forEach(selector => {
          const el = document.querySelector(selector);
          this.log(`Selector "${selector}": ${el ? 'FOUND' : 'NOT FOUND'}`);
        });
      }
    } else {
      this.showOriginalHeader();
      this.removeHamburgerButton();
      this.removeDrawer();
    }
    
    this.setupResizeListener();
  }

  checkMobile() {
    const width = window.innerWidth;
    this.isMobile = width <= this.options.mobileBreakpoint;
    this.isSmallMobile = width <= this.options.smallMobileBreakpoint;
    this.log(`📱 Screen width: ${width}px, Mobile: ${this.isMobile}, Small Mobile: ${this.isSmallMobile}`);
  }

  findHeader() {
    for (const selector of this.options.headerSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.header = element;
        this.log(`✅ Header found using selector: ${selector}`);
        return;
      }
    }
    this.log('❌ No header found with any selector');
  }

  createHamburgerButton() {
    // Remove existing button if any
    this.removeHamburgerButton();

    this.hamburgerButton = document.createElement('button');
    this.hamburgerButton.className = 'mobile-hamburger-btn';
    this.hamburgerButton.setAttribute('aria-label', 'Open navigation menu');
    this.hamburgerButton.setAttribute('aria-expanded', 'false');
    this.hamburgerButton.setAttribute('type', 'button');

    // Complete hamburger icon
    this.hamburgerButton.innerHTML = `
      <div class="hamburger-icon">
        <span class="line line1"></span>
        <span class="line line2"></span>
        <span class="line line3"></span>
      </div>
    `;

    // Enhanced styling with proper constraints
    Object.assign(this.hamburgerButton.style, {
      position: 'fixed',
      top: '15px',
      left: '15px',
      zIndex: '10001',
      width: this.options.hamburgerSize,
      height: this.options.hamburgerSize,
      minWidth: this.options.hamburgerSize,
      maxWidth: this.options.hamburgerSize,
      backgroundColor: this.options.hamburgerBackground,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      margin: '0',
      overflow: 'hidden',
      flexShrink: '0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      transition: `all ${this.options.animationDuration}ms ease`
    });

    // Style the hamburger lines
    const style = document.createElement('style');
    style.textContent = `
      .mobile-hamburger-btn .hamburger-icon {
        width: 20px;
        height: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
      .mobile-hamburger-btn .line {
        width: 100%;
        height: 2px;
        background-color: ${this.options.hamburgerColor};
        transition: all ${this.options.animationDuration}ms ease;
        transform-origin: center;
      }
      .mobile-hamburger-btn.open .line1 {
        transform: translateY(7px) rotate(45deg);
      }
      .mobile-hamburger-btn.open .line2 {
        opacity: 0;
      }
      .mobile-hamburger-btn.open .line3 {
        transform: translateY(-7px) rotate(-45deg);
      }
      .mobile-hamburger-btn:hover {
        background-color: ${this.lightenColor(this.options.hamburgerBackground, 20)};
        transform: scale(1.05);
      }
    `;
    
    if (!document.getElementById('hamburger-styles')) {
      style.id = 'hamburger-styles';
      document.head.appendChild(style);
    }

    document.body.appendChild(this.hamburgerButton);
    this.log('✅ Hamburger button created and positioned');
  }

  createDrawer() {
    // Remove existing drawer if any
    this.removeDrawer();

    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'mobile-drawer-backdrop';
    Object.assign(this.backdrop.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: this.options.backdropColor,
      zIndex: '9999',
      opacity: '0',
      visibility: 'hidden',
      transition: `all ${this.options.animationDuration}ms ease`,
      backdropFilter: 'blur(4px)'
    });

    // Create drawer
    this.drawer = document.createElement('div');
    this.drawer.className = 'mobile-drawer';
    Object.assign(this.drawer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: this.options.drawerHeight,
      backgroundColor: this.options.drawerBackground,
      zIndex: '10000',
      transform: 'translateY(-100%)',
      transition: `transform ${this.options.animationDuration}ms ease`,
      overflowY: 'auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    });

    // Extract navigation items from header
    this.populateDrawer();

    // Add to DOM
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.drawer);
    
    this.log('✅ Drawer created with top slide-in design');
  }

  populateDrawer() {
    if (!this.drawer || !this.header) return;

    // Get page title
    const pageTitle = this.getPageTitle();
    
    // Create drawer content
    const drawerContent = document.createElement('div');
    drawerContent.className = 'drawer-content';
    drawerContent.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
    `;

    // Add page title
    if (pageTitle) {
      const titleElement = document.createElement('h2');
      titleElement.textContent = pageTitle;
      titleElement.style.cssText = `
        color: #fff;
        font-size: 24px;
        font-weight: bold;
        margin: 0 0 20px 0;
        padding-bottom: 15px;
        border-bottom: 2px solid rgba(255,255,255,0.2);
      `;
      drawerContent.appendChild(titleElement);
    }

    // Extract and clone navigation items
    const navItems = this.extractNavigationItems();
    navItems.forEach(item => {
      const drawerItem = this.createDrawerItem(item);
      drawerContent.appendChild(drawerItem);
    });

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Menu';
    closeButton.className = 'drawer-close-btn';
    closeButton.style.cssText = `
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: 2px solid rgba(255,255,255,0.3);
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
      transition: all 200ms ease;
      width: fit-content;
    `;

    closeButton.addEventListener('click', () => this.hideDrawer());
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'rgba(255,255,255,0.1)';
    });

    drawerContent.appendChild(closeButton);
    this.drawer.appendChild(drawerContent);
  }

  getPageTitle() {
    // Try multiple sources for page title
    const titleSources = [
      () => document.querySelector('h1')?.textContent,
      () => document.querySelector('.title')?.textContent,
      () => document.querySelector('.page-title')?.textContent,
      () => document.title,
      () => this.header?.querySelector('.brand, .logo')?.textContent
    ];

    for (const getTitle of titleSources) {
      const title = getTitle();
      if (title && title.trim()) {
        return title.trim();
      }
    }
    return 'Menu';
  }

  extractNavigationItems() {
    const items = [];
    const navSelectors = ['a', 'button', '.nav-item', '.menu-item'];
    
    navSelectors.forEach(selector => {
      const elements = this.header.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.textContent.trim() && !el.classList.contains('mobile-hamburger-btn')) {
          items.push({
            text: el.textContent.trim(),
            href: el.href || '#',
            onclick: el.onclick
          });
        }
      });
    });

    return items;
  }

  createDrawerItem(item) {
    const drawerItem = document.createElement('a');
    drawerItem.textContent = item.text;
    drawerItem.href = item.href;
    if (item.onclick) drawerItem.onclick = item.onclick;
    
    drawerItem.style.cssText = `
      color: #fff;
      text-decoration: none;
      padding: 16px 20px;
      font-size: 16px;
      font-weight: 500;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      transition: all 200ms ease;
      cursor: pointer;
      border-radius: 8px;
      display: block;
    `;

    drawerItem.addEventListener('mouseenter', () => {
      drawerItem.style.backgroundColor = 'rgba(255,255,255,0.1)';
      drawerItem.style.paddingLeft = '24px';
    });

    drawerItem.addEventListener('mouseleave', () => {
      drawerItem.style.backgroundColor = 'transparent';
      drawerItem.style.paddingLeft = '20px';
    });

    drawerItem.addEventListener('click', () => {
      this.hideDrawer();
    });

    return drawerItem;
  }

  setupEventListeners() {
    if (this.hamburgerButton) {
      this.hamburgerButton.addEventListener('click', () => this.toggleDrawer());
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.hideDrawer());
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hideDrawer();
      }
    });

    // Touch gestures
    this.setupTouchGestures();
    
    this.log('✅ Event listeners attached');
  }

  setupTouchGestures() {
    let startY = 0;
    let currentY = 0;

    if (this.drawer) {
      this.drawer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
      }, { passive: true });

      this.drawer.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
      }, { passive: true });

      this.drawer.addEventListener('touchend', () => {
        const deltaY = startY - currentY;
        if (deltaY > 50) { // Swipe up to close
          this.hideDrawer();
        }
      }, { passive: true });
    }
  }

  showDrawer() {
    if (!this.drawer || !this.backdrop) {
      this.log('❌ Cannot show drawer - elements not created');
      return;
    }

    this.isOpen = true;
    
    // Show backdrop
    this.backdrop.style.visibility = 'visible';
    this.backdrop.style.opacity = '1';
    
    // Show drawer
    this.drawer.style.transform = 'translateY(0)';
    
    // Update hamburger button
    if (this.hamburgerButton) {
      this.hamburgerButton.classList.add('open');
      this.hamburgerButton.setAttribute('aria-expanded', 'true');
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    this.log('✅ Drawer opened');
  }

  hideDrawer() {
    if (!this.drawer || !this.backdrop) return;

    this.isOpen = false;
    
    // Hide backdrop
    this.backdrop.style.opacity = '0';
    this.backdrop.style.visibility = 'hidden';
    
    // Hide drawer
    this.drawer.style.transform = 'translateY(-100%)';
    
    // Update hamburger button
    if (this.hamburgerButton) {
      this.hamburgerButton.classList.remove('open');
      this.hamburgerButton.setAttribute('aria-expanded', 'false');
    }

    // Restore body scroll
    document.body.style.overflow = '';
    
    this.log('✅ Drawer closed');
  }

  toggleDrawer() {
    if (this.isOpen) {
      this.hideDrawer();
    } else {
      this.showDrawer();
    }
  }

  hideOriginalHeader() {
    if (this.header) {
      this.header.style.display = 'none';
      this.log('✅ Original header hidden');
    }
  }

  showOriginalHeader() {
    if (this.header) {
      this.header.style.display = '';
      this.log('✅ Original header restored');
    }
  }

  removeHamburgerButton() {
    if (this.hamburgerButton) {
      this.hamburgerButton.remove();
      this.hamburgerButton = null;
    }
  }

  removeDrawer() {
    if (this.drawer) {
      this.drawer.remove();
      this.drawer = null;
    }
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
  }

  setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.checkMobile();
        
        if (wasMobile !== this.isMobile) {
          this.log('📱 Device type changed, reinitializing...');
          this.setup();
        }
      }, 250);
    });
  }

  lightenColor(color, percent) {
    // Simple color lightening function
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  log(message) {
    if (this.options.debugMode) {
      console.log(`[Mobile Header Handler] ${message}`);
    }
  }

  // Public API methods
  refresh() {
    this.setup();
  }

  open() {
    this.showDrawer();
  }

  close() {
    this.hideDrawer();
  }

  toggle() {
    this.toggleDrawer();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.mobileHeaderHandler = new MobileHeaderHandler({
    debugMode: true // Set to false to disable console logging
  });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileHeaderHandler;
}