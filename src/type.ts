// Api gives response in two parts: 1. pagination 2. data

//for data
export interface Artwork {
    id: number;
    title: string;
    place_of_origin: string | null;
    artist_display: string | null;
    inscriptions: string | null;
    date_start: number | null;
    date_end: number | null;
}

//for pagination
export interface ApiResponse {
    data: Artwork[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
    }
}