import dayjs from 'dayjs';

export const formatDate = (isoDate: string) => dayjs(isoDate).format('DD/MM/YYYY HH:mm');
