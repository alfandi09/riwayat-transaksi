function normalizeDateFormat(dateStr) {
    dateStr = dateStr.trim();
    if (dateStr.includes(' ') && dateStr.length > 10) {
        return dateStr.split(' ')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('/');
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('/');
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (error) {
        console.error("Error parsing date:", dateStr, error);
    }
    
    console.error("Unrecognized date format:", dateStr);
    throw new Error(`Format tanggal tidak dikenali: ${dateStr}`);
}
