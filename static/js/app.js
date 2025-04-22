
document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('items-container');
    const breadcrumb = document.getElementById('breadcrumb');
    const loading = document.getElementById('loading');
    const contextMenu = document.getElementById('context-menu');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const inputField = document.getElementById('input-field');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const closeModal = document.querySelector('.close');
    const backBtn = document.getElementById('back-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const newFolderBtn = document.getElementById('new-folder-btn');
    const renameOption = document.getElementById('rename-option');
    const deleteOption = document.getElementById('delete-option');
    const downloadOption = document.getElementById('download-option');

    let currentDirectory = '.';
    let selectedItem = null;
    let history = ['.'];
    let historyIndex = 0;

    // Initialize the app
    loadFiles(currentDirectory);

    // Event Listeners
    backBtn.addEventListener('click', navigateBack);
    forwardBtn.addEventListener('click', navigateForward);
    newFolderBtn.addEventListener('click', showNewFolderModal);
    renameOption.addEventListener('click', showRenameModal);
    deleteOption.addEventListener('click', showDeleteModal);
    downloadOption.addEventListener('click', downloadFile);
    modalConfirmBtn.addEventListener('click', handleModalConfirm);
    modalCancelBtn.addEventListener('click', closeModalDialog);
    closeModal.addEventListener('click', closeModalDialog);

    // Hide context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.closest('#context-menu') === null) {
            contextMenu.style.display = 'none';
        }
    });

    // Functions
    async function loadFiles(directory) {
        showLoading(true);
        try {
            const response = await fetch(`/api/files?directory=${encodeURIComponent(directory)}`);
            if (!response.ok) {
                throw new Error('Failed to load files');
            }
            const data = await response.json();
            renderFiles(data);
            updateBreadcrumb(directory);
            updateNavigationButtons();
        } catch (error) {
            console.error('Error loading files:', error);
            showError('Failed to load files');
        } finally {
            showLoading(false);
        }
    }

    function renderFiles(items) {
        itemsContainer.innerHTML = '';
        
        // Sort items: directories first, then files, both alphabetically
        items.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = `item ${item.type}`;
            itemElement.dataset.path = item.path;
            itemElement.dataset.type = item.type;
            itemElement.dataset.name = item.name;

            const icon = document.createElement('i');
            icon.className = item.type === 'directory' ? 'fas fa-folder' : 'fas fa-file';
            
            const name = document.createElement('p');
            name.textContent = item.name;
            
            itemElement.appendChild(icon);
            itemElement.appendChild(name);
            
            itemElement.addEventListener('click', (e) => {
                if (item.type === 'directory') {
                    navigateTo(item.path);
                }
                selectItem(itemElement);
            });
            
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                selectItem(itemElement);
                showContextMenu(e, item);
            });
            
            itemsContainer.appendChild(itemElement);
        });

        // Clear selection
        selectedItem = null;
    }

    function selectItem(element) {
        // Clear previous selection
        document.querySelectorAll('.item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Set new selection
        element.classList.add('selected');
        selectedItem = {
            path: element.dataset.path,
            type: element.dataset.type,
            name: element.dataset.name
        };
        
        // Update context menu visibility
        if (selectedItem.type === 'file') {
            downloadOption.style.display = 'block';
        } else {
            downloadOption.style.display = 'none';
        }
    }

    function showContextMenu(e, item) {
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
    }

    function updateBreadcrumb(directory) {
        breadcrumb.innerHTML = '';
        
        // Always start with home
        const homeItem = document.createElement('span');
        homeItem.className = 'breadcrumb-item';
        homeItem.textContent = 'Home';
        homeItem.dataset.path = '.';
        homeItem.addEventListener('click', () => navigateTo('.'));
        breadcrumb.appendChild(homeItem);
        
        if (directory !== '.') {
            const parts = directory.split('/');
            let currentPath = '';
            
            parts.forEach((part, index) => {
                if (part === '.') return;
                
                currentPath += (currentPath ? '/' : '') + part;
                
                const item = document.createElement('span');
                item.className = 'breadcrumb-item';
                item.textContent = part;
                item.dataset.path = currentPath;
                
                if (index === parts.length - 1) {
                    item.classList.add('active');
                } else {
                    item.addEventListener('click', () => navigateTo(item.dataset.path));
                }
                
                breadcrumb.appendChild(item);
            });
        } else {
            homeItem.classList.add('active');
        }
    }

    function navigateTo(directory) {
        // Add to history and clear forward history
        history = history.slice(0, historyIndex + 1);
        history.push(directory);
        historyIndex = history.length - 1;
        
        currentDirectory = directory;
        loadFiles(directory);
    }

    function navigateBack() {
        if (historyIndex > 0) {
            historyIndex--;
            currentDirectory = history[historyIndex];
            loadFiles(currentDirectory);
        }
    }

    function navigateForward() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            currentDirectory = history[historyIndex];
            loadFiles(currentDirectory);
        }
    }

    function updateNavigationButtons() {
        backBtn.disabled = historyIndex <= 0;
        forwardBtn.disabled = historyIndex >= history.length - 1;
    }

    function showNewFolderModal() {
        modalTitle.textContent = 'Create New Folder';
        inputField.value = '';
        inputField.placeholder = 'Enter folder name';
        modal.dataset.action = 'newFolder';
        modal.style.display = 'block';
        inputField.focus();
    }

    function showRenameModal() {
        if (!selectedItem) return;
        
        modalTitle.textContent = 'Rename Item';
        inputField.value = selectedItem.name;
        inputField.placeholder = 'Enter new name';
        modal.dataset.action = 'rename';
        modal.style.display = 'block';
        inputField.focus();
        contextMenu.style.display = 'none';
    }

    function showDeleteModal() {
        if (!selectedItem) return;
        
        modalTitle.textContent = 'Confirm Delete';
        modalBody.innerHTML = `<p>Are you sure you want to delete "${selectedItem.name}"?</p>`;
        modal.dataset.action = 'delete';
        modal.style.display = 'block';
        contextMenu.style.display = 'none';
    }

    function downloadFile() {
        if (!selectedItem || selectedItem.type !== 'file') return;
        
        const downloadLink = document.createElement('a');
        downloadLink.href = `/download/${encodeURIComponent(selectedItem.path)}`;
        downloadLink.download = selectedItem.name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        contextMenu.style.display = 'none';
    }

    async function handleModalConfirm() {
        const action = modal.dataset.action;
        
        try {
            if (action === 'newFolder') {
                await createNewFolder();
            } else if (action === 'rename') {
                await renameItem();
            } else if (action === 'delete') {
                await deleteItem();
            }
            
            // Reload files after action
            loadFiles(currentDirectory);
        } catch (error) {
            console.error(`Error during ${action}:`, error);
            showError(`Failed to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        } finally {
            closeModalDialog();
        }
    }

    async function createNewFolder() {
        const folderName = inputField.value.trim();
        
        if (!folderName) {
            throw new Error('Folder name cannot be empty');
        }
        
        const response = await fetch('/api/files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                directory: currentDirectory,
                name: folderName
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create folder');
        }
    }

    async function renameItem() {
        if (!selectedItem) return;
        
        const newName = inputField.value.trim();
        
        if (!newName) {
            throw new Error('Name cannot be empty');
        }
        
        const response = await fetch(`/api/files/${encodeURIComponent(selectedItem.path)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newName: newName
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to rename item');
        }
    }

    async function deleteItem() {
        if (!selectedItem) return;
        
        const response = await fetch(`/api/files/${encodeURIComponent(selectedItem.path)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete item');
        }
    }

    function closeModalDialog() {
        modal.style.display = 'none';
        modalBody.innerHTML = '<input type="text" id="input-field" placeholder="Enter name">';
        inputField = document.getElementById('input-field');
    }

    function showLoading(show) {
        loading.style.display = show ? 'flex' : 'none';
        itemsContainer.style.display = show ? 'none' : 'grid';
    }

    function showError(message) {
        // Simple alert for now, could be replaced with a toast notification
        alert(message);
    }
});
