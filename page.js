
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
