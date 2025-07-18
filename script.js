document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Functionality ---
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeIcon = document.getElementById('close-icon');

    if (hamburgerIcon && mobileMenu && closeIcon) {
        hamburgerIcon.addEventListener('click', () => mobileMenu.classList.add('active'));
        closeIcon.addEventListener('click', () => mobileMenu.classList.remove('active'));
    }

    // --- WhatsApp Button Functionality ---
    const yourWhatsAppNumber = '+233241465282'; // Your number

    document.body.addEventListener('click', (e) => {
        // For "Rent" buttons
        if (e.target.classList.contains('rent-btn')) {
            const itemName = e.target.getAttribute('data-item');
            const message = `I want to rent the ${itemName}`;
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

    // --- Dynamic Listings from Airtable ---
    const itemGrid = document.getElementById('item-grid');

    if (itemGrid) {
        // --- Airtable details with your new token ---
        const AIRTABLE_API_KEY = 'patQLNUaYIFPHFMkE.0c6bfd7e1b9cd2fbc21521db8be464aaa3af53748af3f36ff869ff36a1ecad03';
        const AIRTABLE_BASE_ID = 'appaUxlP1Mix6giZq';
        const AIRTABLE_TABLE_NAME = 'Campus Share Listings';

        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

        fetch(url, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_KEY}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                let allItems = [];
                if (!data.records) {
                    console.error("Airtable data is missing 'records' array:", data);
                    itemGrid.innerHTML = "<p>Could not find any listings. The database might be empty or improperly formatted.</p>";
                    return;
                }

                data.records.forEach(record => {
                    const listing = record.fields;

                    const imageUrl = listing.Image && listing.Image[0] ? listing.Image[0].url : null;

                    if (!listing.Title || !listing.Category || !imageUrl) {
                        console.warn('Skipping a record because it is missing a required field: Title, Category, or Image.', listing);
                        return;
                    }

                    const card = document.createElement('div');
                    card.className = 'item-card';
                    card.setAttribute('data-category', listing.Category.toLowerCase());

                    card.innerHTML = `
                    <img src="${imageUrl}" class="item-card-img" alt="${listing.Title}">
                    <div class="item-card-body">
                        <p class="item-location"><i class="fas fa-map-marker-alt"></i> ${listing.Location || 'Campus-wide'}</p>
                        <h3 class="item-title">${listing.Title}</h3>
                        <p class="item-price">₵${listing.Price || 0} <span>${listing.Unit || '/ day'}</span></p>
                        <button class="cta-button rent-btn" data-item="${listing.Title}">Rent</button>
                    </div>
                `;
                    itemGrid.appendChild(card);
                    allItems.push(card);
                });

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
                itemGrid.innerHTML = "<p>Error loading listings. Please double-check your API key, Base ID, and table name, and ensure your Airtable is not empty.</p>";
            });
    }
});