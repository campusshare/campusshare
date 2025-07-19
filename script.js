document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Functionality ---
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeIcon = document.getElementById('close-icon');

    if (hamburgerIcon && mobileMenu && closeIcon) {
        hamburgerIcon.addEventListener('click', () => mobileMenu.classList.add('active'));
        closeIcon.addEventListener('click', () => mobileMenu.classList.remove('active'));
    }

    // --- **UPDATED** WhatsApp Button Functionality ---
    const yourWhatsAppNumber = '+233241465282'; // Your number

    document.body.addEventListener('click', (e) => {
        // For "Rent" buttons
        if (e.target.classList.contains('rent-btn')) {
            const itemName = e.target.getAttribute('data-item');
            const itemImageUrl = e.target.getAttribute('data-image-url'); // Get the image URL

            // Create the new message with the image link
            const message = `I want to rent the ${itemName}\n\n${itemImageUrl || ''}`;

            const whatsappUrl = `https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
        // For "Become a Renter" buttons
        if (e.target.classList.contains('become-renter-btn')) {
            const message = `I want to rent out my stuff`;
            const whatsappUrl = `https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    });

    // --- **NEW** Theme Toggle Functionality ---
    const themeToggle = document.getElementById('theme-toggle');

    const setTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('theme');
            if (document.documentElement.classList.contains('dark-mode') || (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    }

    // --- **NEW** Fade-in on Scroll Functionality ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const startObserving = (elements) => {
        elements.forEach(el => observer.observe(el));
    };

    const staticFadeInElements = document.querySelectorAll('.fade-in-element');
    startObserving(staticFadeInElements);


    // --- Dynamic Listings from Airtable (with animation logic included) ---
    const itemGrid = document.getElementById('item-grid');

    if (itemGrid) {
        const loader = document.getElementById('loader');

        const AIRTABLE_API_KEY = 'patQLNUaYIFPHFMkE.0c6bfd7e1b9cd2fbc21521db8be464aaa3af53748af3f36ff869ff36a1ecad03';
        const AIRTABLE_BASE_ID = 'appaUxlP1Mix6giZq';
        const AIRTABLE_TABLE_NAME = 'Campus Share Listings';

        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

        fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } })
            .then(response => {
                if (!response.ok) { throw new Error('Network response was not ok'); }
                return response.json();
            })
            .then(data => {
                if (loader) loader.style.display = 'none';

                let allItems = [];
                if (!data.records) {
                    itemGrid.innerHTML = "<p>Could not find any listings.</p>";
                    return;
                }

                data.records.forEach(record => {
                    const listing = record.fields;
                    const imageUrl = listing.Image && listing.Image[0] ? listing.Image[0].url : null;
                    if (!listing.Title || !listing.Category || !imageUrl) {
                        return;
                    }

                    const card = document.createElement('div');
                    card.className = 'item-card fade-in-element';
                    card.setAttribute('data-category', listing.Category.toLowerCase());

                    // **UPDATED** The button now includes the 'data-image-url'
                    card.innerHTML = `
                        <img src="${imageUrl}" class="item-card-img" alt="${listing.Title}">
                        <div class="item-card-body">
                            <p class="item-location"><i class="fas fa-map-marker-alt"></i> ${listing.Location || 'Campus-wide'}</p>
                            <h3 class="item-title">${listing.Title}</h3>
                            <p class="item-price">₵${listing.Price || 0} <span>${listing.Unit || '/ day'}</span></p>
                            <button class="cta-button rent-btn" data-item="${listing.Title}" data-image-url="${imageUrl}">Rent</button>
                        </div>
                    `;
                    itemGrid.appendChild(card);
                    allItems.push(card);
                });

                startObserving(allItems);

                // --- Search and Filter Functionality ---
                const searchInput = document.getElementById('searchInput');
                const filterBtns = document.querySelectorAll('.filter-btn');
                const noResults = document.getElementById('no-results');

                if (searchInput && filterBtns.length > 0) {
                    const filterItems = () => {
                        const searchTerm = searchInput.value.toLowerCase();
                        const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-category');
                        let itemsFound = false;

                        allItems.forEach(item => {
                            const itemCategory = item.getAttribute('data-category');
                            const itemText = item.textContent.toLowerCase();
                            const categoryMatch = activeCategory === 'all' || itemCategory === activeCategory;
                            const searchMatch = itemText.includes(searchTerm);

                            if (categoryMatch && searchMatch) {
                                item.style.display = 'flex';
                                itemsFound = true;
                            } else {
                                item.style.display = 'none';
                            }
                        });

                        if (noResults) {
                            noResults.style.display = itemsFound ? 'none' : 'block';
                        }
                    };
                    searchInput.addEventListener('keyup', filterItems);
                    filterBtns.forEach(btn => {
                        btn.addEventListener('click', () => {
                            document.querySelector('.filter-btn.active').classList.remove('active');
                            btn.classList.add('active');
                            filterItems();
                        });
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching from Airtable:", error);
                if (loader) loader.style.display = 'none';
                itemGrid.innerHTML = "<p>Error loading listings. Please double-check your API key, Base ID, and table name.</p>";
            });
    }
});
