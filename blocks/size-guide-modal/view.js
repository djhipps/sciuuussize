/**
 * Size Guide Modal - Frontend JavaScript
 * Handles button clicks, loads shoe size data, and displays modal
 */

// Store loaded shoe sizes data globally
let shoeSizesData = null;

// Color to shoe type mapping
const colorToTypeMapping = {
    'arancione': { type: 'scarpe_bambini', guide: 'arancione' },
    'verde': { type: 'scarpe_bebe', guide: 'verde' },
    'rosso': { type: 'scarpe_bebe', guide: 'rosso' },
    'giallo': { type: 'sandali', guide: 'giallo' }
};

/**
 * Load shoe sizes JSON data
 */
async function loadShoeSizesData() {
    if (shoeSizesData) {
        return shoeSizesData;
    }

    try {
        const response = await fetch(sciuusSizeData.jsonUrl);
        if (!response.ok) {
            throw new Error('Failed to load shoe sizes data');
        }
        shoeSizesData = await response.json();
        return shoeSizesData;
    } catch (error) {
        console.error('Error loading shoe sizes:', error);
        return null;
    }
}

/**
 * Get size data for the current product based on color
 */
function getSizeDataForProduct(data, color) {
    const mapping = colorToTypeMapping[color];
    if (!mapping) {
        console.error('Unknown color:', color);
        return null;
    }

    const shoeType = data[mapping.type];
    if (!shoeType) {
        console.error('Shoe type not found:', mapping.type);
        return null;
    }

    const guide = shoeType.guides[mapping.guide];
    if (!guide) {
        console.error('Guide not found:', mapping.guide);
        return null;
    }

    return {
        categoryLabel: shoeType.label,
        guideLabel: guide.label,
        sizes: guide.sizes,
        color: color,
        colorHex: sciuusSizeData.colorMap[color].hex
    };
}

/**
 * Create and display the modal with size data
 */
function showSizeGuideModal(sizeData) {
    // Check if modal already exists
    let modal = document.getElementById('sciuuus-size-modal');

    if (!modal) {
        // Create modal structure
        modal = document.createElement('div');
        modal.id = 'sciuuus-size-modal';
        modal.className = 'sciuuus-modal';
        modal.innerHTML = `
            <div class="sciuuus-modal-overlay"></div>
            <div class="sciuuus-modal-content">
                <button class="sciuuus-modal-close" aria-label="Close">&times;</button>
                <div class="sciuuus-modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal on overlay click or close button
        modal.querySelector('.sciuuus-modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.sciuuus-modal-close').addEventListener('click', closeModal);

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Populate modal with size data
    const modalBody = modal.querySelector('.sciuuus-modal-body');
    modalBody.innerHTML = `
        <div class="sciuuus-modal-header">
            <h2>${sizeData.categoryLabel}</h2>
            <div class="sciuuus-guide-indicator">
                <span class="sciuuus-color-badge" style="background-color: ${sizeData.colorHex};"></span>
                <span class="sciuuus-guide-label">${sizeData.guideLabel}</span>
            </div>
        </div>
        <div class="sciuuus-size-table-wrapper">
            <table class="sciuuus-size-table">
                <thead>
                    <tr>
                        <th>Taglia</th>
                        <th>Lunghezza suola (cm)</th>
                        <th>Larghezza suola (cm)</th>
                    </tr>
                </thead>
                <tbody>
                    ${sizeData.sizes.map(size => `
                        <tr>
                            <td class="sciuuus-size-number">${size.taglia}</td>
                            <td>${size.lunghezza_suola_cm}</td>
                            <td>${size.larghezza_suola_cm}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="sciuuus-modal-footer">
            <p><em>Misura la lunghezza e la larghezza del piede del bambino e confronta con la tabella sopra.</em></p>
        </div>
    `;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close the modal
 */
function closeModal() {
    const modal = document.getElementById('sciuuus-size-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Handle button click
 */
async function handleButtonClick(event) {
    const button = event.currentTarget;
    const block = button.closest('.wp-block-sciuuussize-size-guide-modal');

    // Get the color from the data attribute
    const color = block.dataset.sizeGuideColor || 'arancione';

    // Show loading state
    button.disabled = true;
    button.textContent = 'Caricamento...';

    try {
        // Load size data
        const data = await loadShoeSizesData();
        if (!data) {
            throw new Error('Failed to load size data');
        }

        // Get size data for this product's color
        const sizeData = getSizeDataForProduct(data, color);
        if (!sizeData) {
            throw new Error('Size data not found for color: ' + color);
        }

        // Show modal
        showSizeGuideModal(sizeData);
    } catch (error) {
        console.error('Error displaying size guide:', error);
        alert('Si è verificato un errore nel caricamento della guida alle taglie. Riprova più tardi.');
    } finally {
        // Restore button state
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}

/**
 * Initialize all size guide buttons on the page
 */
function initializeSizeGuideButtons() {
    const buttons = document.querySelectorAll('.sciuuus-size-guide-button');

    buttons.forEach(button => {
        // Store original button text
        button.dataset.originalText = button.textContent.trim();

        // Add click event listener
        button.addEventListener('click', handleButtonClick);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSizeGuideButtons);
} else {
    initializeSizeGuideButtons();
}

// Re-initialize if new content is loaded dynamically (e.g., AJAX)
document.addEventListener('sciuuus-reinit', initializeSizeGuideButtons);
