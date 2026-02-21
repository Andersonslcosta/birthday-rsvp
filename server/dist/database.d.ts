export interface Participant {
    name: string;
    age: number | null;
    isChild: boolean;
}
export interface RSVP {
    id: string;
    responsibleName: string;
    confirmation: 'sim' | 'nao';
    totalPeople: number;
    participants: Participant[];
    timestamp: string;
    createdAt: string;
    updatedAt: string;
}
export interface Statistics {
    totalGuests: number;
    confirmed: number;
    declined: number;
    totalConfirmed: number;
    adults: number;
    children: number;
}
export declare function initDatabase(): Promise<void>;
export declare function saveRSVP(rsvp: Omit<RSVP, 'id' | 'createdAt' | 'updatedAt'>): Promise<RSVP>;
export declare function getAllRSVPs(): Promise<RSVP[]>;
export declare function geStatistics(): Promise<Statistics>;
export declare function deleteAllRSVPs(): Promise<void>;
export declare function deleteRSVPById(id: string): Promise<void>;
export declare function logAdminAction(action: string, details?: string): Promise<void>;
//# sourceMappingURL=database.d.ts.map