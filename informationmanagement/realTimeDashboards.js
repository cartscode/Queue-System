
        // Initialize Lucide icons on load
        lucide.createIcons();

        // Get elements
        const dashboardContainer = document.getElementById('dashboard-container');
        const regularTemplate = document.getElementById('regular-template');
        const priorityTemplate = document.getElementById('priority-template');
        const tabRegular = document.getElementById('tab-regular');
        const tabPriority = document.getElementById('tab-priority');

        // Define state classes for smooth transition
        const ACTIVE_CLASSES = ['bg-purple-700', 'text-white', 'shadow-xl', 'hover:bg-purple-800', 'border-transparent'];
        const INACTIVE_CLASSES = ['bg-white', 'text-gray-700', 'border', 'border-gray-300', 'shadow-md', 'hover:bg-gray-100'];


        /**
         * Switches the content displayed in the dashboard container and manages button styles.
         * @param {string} view - The view to display ('regular' or 'priority').
         */
        function showDashboard(view) {
            // 1. Clear existing content
            dashboardContainer.innerHTML = '';
            
            // 2. Clone and append new content based on the view
            if (view === 'regular') {
                const clone = regularTemplate.content.cloneNode(true);
                dashboardContainer.appendChild(clone);
                
                // 3. Update active button styles for REGULAR tab
                // Remove inactive classes and add active classes to Regular tab
                tabRegular.classList.remove(...INACTIVE_CLASSES);
                tabRegular.classList.add(...ACTIVE_CLASSES);
                
                // Remove active classes and add inactive classes to Priority tab
                tabPriority.classList.remove(...ACTIVE_CLASSES);
                tabPriority.classList.add(...INACTIVE_CLASSES);

                // Ensure the icon in the regular tab is white (from the ACTIVE_CLASSES)
                const regularIcon = tabRegular.querySelector('[data-lucide="users"]');
                if(regularIcon) regularIcon.classList.remove('text-red-600'); 
            
            } else if (view === 'priority') {
                const clone = priorityTemplate.content.cloneNode(true);
                dashboardContainer.appendChild(clone);
                
                // 3. Update active button styles for PRIORITY tab
                // Remove inactive classes and add active classes to Priority tab
                tabPriority.classList.remove(...INACTIVE_CLASSES);
                tabPriority.classList.add(...ACTIVE_CLASSES);

                // Remove active classes and add inactive classes to Regular tab
                tabRegular.classList.remove(...ACTIVE_CLASSES);
                tabRegular.classList.add(...INACTIVE_CLASSES);

                // Ensure the icon in the priority tab is white (from the ACTIVE_CLASSES)
                const priorityIcon = tabPriority.querySelector('[data-lucide="wheelchair"]');
                if(priorityIcon) priorityIcon.classList.add('text-white');
            }

            // 4. Re-initialize icons for the newly injected content
            lucide.createIcons();
        }

        // Load the regular dashboard on initial page load
        window.onload = () => {
             // Re-initialize icons from the main document (nav bar)
            lucide.createIcons();
            // Manually set initial state for smooth transition on first load
            tabRegular.classList.add(...ACTIVE_CLASSES);
            tabPriority.classList.add(...INACTIVE_CLASSES);
            showDashboard('regular');
        };


