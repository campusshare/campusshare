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
    const yourWhatsAppNumber = '+233241465282'; // IMPORTANT: Replace with your actual number

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


    // --- Search and Filter Functionality (for rentals.html) ---
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const itemGrid = document.getElementById('item-grid');
    const noResults = document.getElementById('no-results');

    if (searchInput && itemGrid) {
        const allItems = Array.from(itemGrid.getElementsByClassName('item-card'));

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

            noResults.style.display = itemsFound ? 'none' : 'block';
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

});