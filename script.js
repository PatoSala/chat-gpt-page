const services = document.querySelectorAll('.service');
const servicesList = document.getElementById('services-list');
const favoritesList = document.getElementById('favorites-list');
const recycleBin = document.getElementById('recycle-bin');
let draggedService = null;

// Function to create a copy of a service element
function createServiceCopy(originalService) {
    const copyService = originalService.cloneNode(true);
    copyService.classList.add('favorite'); // Add a class to indicate it's a favorite
    copyService.classList.remove('service'); // Remove the original class
    copyService.addEventListener('dragstart', function(event) {
        draggedService = this;
        event.dataTransfer.setData('text/plain', null);
    });
    favoritesList.appendChild(copyService);
    saveServiceData(); // Save the updated favorites list after a drop event
}

// Function to save the order of services and favorites list in local storage
function saveServiceData() {
    const serviceData = {
        services: Array.from(servicesList.children).map(service => service.dataset.service),
        favorites: Array.from(favoritesList.children).map(service => service.dataset.service)
    };
    localStorage.setItem('serviceData', JSON.stringify(serviceData));
}

// Function to load the order of services and favorites list from local storage
function loadServiceData() {
    const storedData = JSON.parse(localStorage.getItem('serviceData'));
    if (storedData) {
        const serviceMap = new Map();
        services.forEach(service => serviceMap.set(service.dataset.service, service));

        // Load services
        storedData.services.forEach(serviceName => {
            const service = serviceMap.get(serviceName);
            if (service) {
                servicesList.appendChild(service);
            }
        });

        // Load favorites
        storedData.favorites.forEach(serviceName => {
            const service = serviceMap.get(serviceName);
            if (service) {
                createServiceCopy(service);
            }
        });
    }
}

loadServiceData(); // Load the data when the page loads

services.forEach(service => {
    service.addEventListener('dragstart', function(event) {
        draggedService = this;
        event.dataTransfer.setData('text/plain', null);
    });

    service.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    service.addEventListener('drop', function(event) {
        event.preventDefault();
        if (draggedService !== this) {
            const draggedIndex = Array.from(this.parentNode.children).indexOf(draggedService);
            const dropIndex = Array.from(this.parentNode.children).indexOf(this);

            if (draggedIndex < dropIndex) {
                this.parentNode.insertBefore(draggedService, this.nextSibling);
            } else {
                this.parentNode.insertBefore(draggedService, this);
            }

            saveServiceData(); // Save the updated order after a drop event
        }
        draggedService = null;
    });
});

favoritesList.addEventListener('dragover', function(event) {
    event.preventDefault();
});

favoritesList.addEventListener('drop', function(event) {
    event.preventDefault();
    if (draggedService && !draggedService.classList.contains('favorite')) {
        const serviceName = draggedService.dataset.service;
        const isAlreadyInFavorites = Array.from(favoritesList.children).some(service => service.dataset.service === serviceName);
        
        if (!isAlreadyInFavorites) {
            createServiceCopy(draggedService);
        }
    }
    draggedService = null;
});

// remove favorite
recycleBin.addEventListener('dragover', function(event) {
    event.preventDefault();
});

recycleBin.addEventListener('drop', function(event) {
    event.preventDefault();
    if (draggedService && draggedService.classList.contains('favorite')) {
        draggedService.remove();
        saveServiceData(); // Save the updated favorites list after removal
    }
});
