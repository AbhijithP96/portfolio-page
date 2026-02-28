class CertificateManager {
  constructor(options = {}) {
    this.certificates = [];
    this.containerSelector = options.containerSelector || '#certScroll';
    this.jsonPath = options.jsonPath || 'certificates.json';

    this.container = document.querySelector(this.containerSelector);
    if (!this.container) {
      console.error(`Container element not found: ${this.containerSelector}`);
      return;
    }

    // Modal elements references
    this.modal = null;
    this.modalTitle = null;
    this.modalIssuer = null;
    this.modalDesc = null;
    this.modalImage = null;
    this.modalCloseBtn = null;

    this.init();
  }

  async init() {
    this.createModal();
    await this.loadCertificates();
    this.renderCertificates();
    
    // Add resize listener for responsive card sizing
    window.addEventListener('resize', () => {
      this.renderCertificates();
    });
  }

  async loadCertificates() {
    try {
      const res = await fetch(this.jsonPath);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      this.certificates = await res.json();
    } catch (err) {
      console.error('Error loading certificates:', err);
      this.container.innerHTML = `<p style="color: #f00;">Failed to load certificates. Please check ${this.jsonPath}.</p>`;
    }
  }

  calculateCardWidth() {
    const containerWidth = this.container.offsetWidth;
    const numCards = this.certificates.length;
    const gap = 16;
    const containerPadding = 24; // 12px on each side
    
    if (numCards === 0) return 160;
    if (numCards === 1) return Math.min(300, containerWidth - containerPadding);
    
    // Calculate available width for cards
    const availableWidth = containerWidth - containerPadding - (gap * (numCards - 1));
    const cardWidth = availableWidth / numCards;
    
    // Ensure minimum card width of 120px
    return Math.max(120, cardWidth);
  }

  renderCertificates() {
    this.container.innerHTML = '';

    // Apply essential container styling
    Object.assign(this.container.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      scrollBehavior: 'smooth',
      gap: '16px',
      padding: '12px',
      width: '100%',
      boxSizing: 'border-box'
    });

    const cardWidth = this.calculateCardWidth();
    const isSmallCard = cardWidth <= 180;

    this.certificates.forEach((cert, idx) => {
      const card = document.createElement('div');
      card.className = 'cert-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View certificate: ${cert.name} issued by ${cert.issuer}`);
      card.dataset.index = idx;

      // Apply dynamic card styles
      Object.assign(card.style, {
        background: '#262626',
        borderRadius: '14px',
        width: `${cardWidth}px`,
        boxSizing: 'border-box',
        padding: '10px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        flexShrink: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        userSelect: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      });
      
      // Hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.02)';
        card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.7)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'none';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
      });

      // Image box
      const imageBox = document.createElement('div');
      imageBox.className = 'cert-img-box';
      Object.assign(imageBox.style, {
        width: '100%',
        aspectRatio: '1 / 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '10px',
        background: '#191919',
        marginBottom: '8px',
        flexShrink: '0',
      });

      const img = document.createElement('img');
      img.className = 'cert-img';
      img.src = cert.image || '';
      img.alt = cert.name || 'Certificate image';
      Object.assign(img.style, {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block',
      });

      imageBox.appendChild(img);

      // Title with responsive text size
      const title = document.createElement('p');
      title.className = 'cert-title';
      title.textContent = cert.name || '';
      Object.assign(title.style, {
        fontWeight: '600',
        fontSize: isSmallCard ? '12px' : '14px',
        color: '#fff',
        margin: '0',
        lineHeight: '1.3',
        minHeight: isSmallCard ? '32px' : '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        wordWrap: 'break-word',
        hyphens: 'auto'
      });

      // Issuer with responsive text size
      const issuer = document.createElement('p');
      issuer.className = 'cert-issuer';
      issuer.textContent = cert.issuer || '';
      Object.assign(issuer.style, {
        fontSize: isSmallCard ? '10px' : '12px',
        color: '#ababab',
        margin: '0',
        lineHeight: '1.2',
        minHeight: isSmallCard ? '20px' : '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        wordWrap: 'break-word'
      });

      card.appendChild(imageBox);
      card.appendChild(title);
      card.appendChild(issuer);

      // Click and keyboard events
      card.addEventListener('click', () => this.showModal(cert));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.showModal(cert);
        }
      });

      this.container.appendChild(card);
    });
  }

  createModal() {
    const modalHTML = `
      <div id="cert-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" style="
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.75);
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      ">
        <div id="modal-content" style="
          background: #262626;
          border-radius: 14px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
          color: #ababab;
          box-sizing: border-box;
          position: relative;
        ">
          <button id="modal-close" aria-label="Close modal" style="
            position: absolute;
            top: 16px;
            right: 20px;
            background: none;
            border: none;
            font-size: 32px;
            color: #ababab;
            cursor: pointer;
            transition: color 0.2s ease;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">&times;</button>
          <div id="modal-image" style="
            width: 100%;
            height: 0;
            padding-bottom: 75%;
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
            border-radius: 10px;
            margin-bottom: 2rem;
            background-color: #191919;
          "></div>
          <h2 id="modal-title" style="
            font-size: 1.8rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 0.8rem;
            line-height: 1.2;
          "></h2>
          <p id="modal-issuer" style="
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
            color: #ababab;
            font-style: italic;
          "></p>
          <p id="modal-description" style="
            font-size: 1rem;
            line-height: 1.5;
            color: #ababab;
          "></p>
        </div>
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    this.modal = tempDiv.firstElementChild;

    document.body.appendChild(this.modal);

    this.modalTitle = this.modal.querySelector('#modal-title');
    this.modalIssuer = this.modal.querySelector('#modal-issuer');
    this.modalDesc = this.modal.querySelector('#modal-description');
    this.modalImage = this.modal.querySelector('#modal-image');
    this.modalCloseBtn = this.modal.querySelector('#modal-close');

    // Setup modal close events
    this.modalCloseBtn.addEventListener('click', () => this.hideModal());
    this.modalCloseBtn.addEventListener('mouseenter', () => {
      this.modalCloseBtn.style.color = '#fff';
    });
    this.modalCloseBtn.addEventListener('mouseleave', () => {
      this.modalCloseBtn.style.color = '#ababab';
    });
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hideModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'flex') {
        this.hideModal();
      }
    });
  }

  showModal(cert) {
    this.modalTitle.textContent = cert.name || '';
    this.modalIssuer.textContent = cert.issuer ? `Issued by ${cert.issuer}` : '';
    this.modalDesc.textContent = cert.description || 'No description available.';
    this.modalImage.style.backgroundImage = `url('${cert.image || ''}')`;

    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    this.modalCloseBtn.focus();
  }

  hideModal() {
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Initialize automatically on DOM load with default selector
document.addEventListener('DOMContentLoaded', () => {
  new CertificateManager({ 
    containerSelector: '#certScroll', 
    jsonPath: '/static/data/cert.json' 
  });
});