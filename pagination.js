function renderPaginationControls() {
    // Cari container pagination, atau buat jika belum ada
    let paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationContainer';
        paginationContainer.className = 'flex justify-center items-center my-6 space-x-2';
        
        // Tempatkan kontrol pagination setelah container transaksi
        const transaksiContainer = document.getElementById('transaksiContainer');
        if (transaksiContainer && transaksiContainer.parentNode) {
            transaksiContainer.parentNode.insertBefore(paginationContainer, transaksiContainer.nextSibling);
        }
    }
    
    // Bersihkan container
    paginationContainer.innerHTML = '';
    
    // Jika hanya ada 1 halaman, tidak perlu menampilkan pagination
    if (paginationState.totalPages <= 1) {
        return;
    }
    
    // Render kontrol pagination
    const { currentPage, totalPages } = paginationState;
    
    // Tombol Previous
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    });
    paginationContainer.appendChild(prevButton);
    
    // Render nomor halaman
    const pagesToShow = calculatePagesToShow(currentPage, totalPages);
    
    pagesToShow.forEach(pageNum => {
        if (pageNum === '...') {
            // Ellipsis
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        } else {
            // Tombol halaman
            const pageButton = document.createElement('button');
            pageButton.className = `px-3 py-1 rounded-md ${pageNum === currentPage ? 'bg-secondary text-white' : 'bg-gray-200 hover:bg-gray-300'}`;
            pageButton.textContent = pageNum;
            pageButton.addEventListener('click', () => {
                if (pageNum !== currentPage) {
                    changePage(pageNum);
                }
            });
            paginationContainer.appendChild(pageButton);
        }
    });
    
    // Tombol Next
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    });
    paginationContainer.appendChild(nextButton);
    
    // Dropdown untuk memilih jumlah item per halaman
    const itemsPerPageContainer = document.createElement('div');
    itemsPerPageContainer.className = 'ml-4 flex items-center';
    
    const itemsPerPageLabel = document.createElement('span');
    itemsPerPageLabel.className = 'text-sm mr-2';
    itemsPerPageLabel.textContent = 'Tampilkan:';
    itemsPerPageContainer.appendChild(itemsPerPageLabel);
    
    const itemsPerPageSelect = document.createElement('select');
    itemsPerPageSelect.className = 'bg-white border border-gray-300 rounded-md px-2 py-1 text-sm';
    [10, 20, 50, 100].forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        if (value === paginationState.itemsPerPage) {
            option.selected = true;
        }
        itemsPerPageSelect.appendChild(option);
    });
    
    itemsPerPageSelect.addEventListener('change', () => {
        const newItemsPerPage = parseInt(itemsPerPageSelect.value);
        if (newItemsPerPage !== paginationState.itemsPerPage) {
            paginationState.itemsPerPage = newItemsPerPage;
            // Reset ke halaman 1 saat mengubah jumlah item per halaman
            changePage(1);
        }
    });
    
    itemsPerPageContainer.appendChild(itemsPerPageSelect);
    paginationContainer.appendChild(itemsPerPageContainer);
}

function calculatePagesToShow(currentPage, totalPages) {
    const pages = [];
    
    // Jika total halaman <= 7, tampilkan semua halaman
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }
    
    // Selalu tampilkan halaman pertama
    pages.push(1);
    
    // Tentukan range halaman yang akan ditampilkan di sekitar halaman saat ini
    if (currentPage <= 3) {
        // Jika dekat dengan awal, tampilkan halaman 2-5
        for (let i = 2; i <= 5; i++) {
            pages.push(i);
        }
        pages.push('...');
    } else if (currentPage >= totalPages - 2) {
        // Jika dekat dengan akhir, tampilkan ellipsis di awal
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
            pages.push(i);
        }
    } else {
        // Jika di tengah, tampilkan ellipsis di awal dan akhir
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
        }
        pages.push('...');
    }
    
    // Selalu tampilkan halaman terakhir
    pages.push(totalPages);
    
    return pages;
}

function changePage(page) {
    // Validasi halaman yang diminta
    page = parseInt(page);
    if (isNaN(page) || page < 1 || page > paginationState.totalPages) {
        return;
    }
    
    console.log(`Mengganti ke halaman ${page}`);
    
    // Simpan filter tanggal yang aktif saat ini
    const applyDateFilter = document.getElementById("dateRange").value !== '';
    
    // Muat data untuk halaman yang diminta
    loadTransaksi(applyDateFilter, page, paginationState.itemsPerPage);
    
    // Scroll ke atas halaman
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function initPagination() {
    // Pastikan paginationState terisi dengan nilai default
    paginationState.currentPage = 1;
    paginationState.itemsPerPage = 10;
    
    // Tambahkan listener untuk tombol Filter
    const filterButton = document.querySelector('button[onclick="loadTransaksi()"]');
    if (filterButton) {
        // Override onclick handler
        filterButton.onclick = function() {
            loadTransaksi(true, 1, paginationState.itemsPerPage);
        };
    }
    
    // Tambahkan listener untuk tombol Refresh
    const refreshButton = document.getElementById('refreshpage');
    if (refreshButton) {
        // Override onclick handler
        refreshButton.onclick = function() {
            loadTransaksi(false, paginationState.currentPage, paginationState.itemsPerPage);
        };
    }
}
