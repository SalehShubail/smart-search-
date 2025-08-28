import type { GroundingChunk } from '../types';

export const exportToCsv = (filename: string, data: GroundingChunk[], headers: {title: string, url: string}) => {
    if (!data || data.length === 0) {
        console.warn("No data to export.");
        return;
    }

    const csvHeaders = [headers.title, headers.url];
    const rows = data
        .filter(item => item.web && item.web.uri && item.web.title) 
        .map(item => {
            const title = `"${item.web!.title!.replace(/"/g, '""')}"`;
            const url = `"${item.web!.uri}"`;
            return [title, url].join(',');
        });

    const csvContent = [csvHeaders.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};