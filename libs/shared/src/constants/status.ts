export const STATUS_TRANSITIONS: Record<string, string[]> = {
    'new': ['in-progress', 'pending', 'closed'],
    'in-progress': ['pending', 'closed'],
    'pending': ['in-progress', 'closed'],
    'closed': []
};