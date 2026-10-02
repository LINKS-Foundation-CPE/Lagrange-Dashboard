import { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';
//import { io } from 'socket.io-client';

//const SOCKET_URL = 'http://localhost:4000';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const dataProvider = useDataProvider();

    useEffect(() => {
        // Fetch initial notifications from REST
        const fetchNotifications = async () => {
            try {
                const { data } = await dataProvider.getList('notifications', {
                    // pagination: { page: 1, perPage: 100 },
                    sort: { field: 'createdAt', order: 'DESC' },
                });
                setNotifications(data);
            } catch (err) {
                console.error('Error loading notifications', err);
            }
        };

        fetchNotifications();

        // Poll every 30 seconds
        const intervalId = setInterval(fetchNotifications, 30 * 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);

        // Setup WebSocket
        // const socket = io(SOCKET_URL, {
        //     transports: ['websocket'],
        //     auth: {
        //         token,
        //     },
        // });

        // socket.on('connect', () => {
        //     console.log('Connected to notification WS');
        // });

        // socket.on('notification', (notif) => {
        //     setNotifications(prev => [notif, ...prev]);
        // });

        // socket.on('disconnect', () => {
        //     console.log('WS disconnected');
        // });

        // return () => {
        //     socket.disconnect();
        // };
    }, [dataProvider]);

    const markAsRead = async (id: string) => {
        try {
            await dataProvider.markNotificationAsRead(id);

            // Update local state to reflect change
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    /**
     * Mark every unread notification this hook holds as read.
     *
     * Lives here rather than in a component because the app bar has no list
     * context to read from, unlike the notifications page. Returns what
     * happened so the caller can say so — a bell that silently marks nothing
     * is indistinguishable from one that worked.
     *
     * `allSettled`, not `all`: one rejection would otherwise discard the
     * outcome of every other request, reporting a partly-successful run as a
     * plain failure.
     */
    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return { marked: 0, failed: 0 };

        const results = await Promise.allSettled(
            unread.map(n => dataProvider.markNotificationAsRead(String(n.id)))
        );

        const ok = new Set(
            unread
                .filter((_, i) => results[i].status === 'fulfilled')
                .map(n => n.id)
        );
        setNotifications(prev =>
            prev.map(n => (ok.has(n.id) ? { ...n, read: true } : n))
        );

        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length) {
            // The reason carries the API's status and message; swallowing it
            // is what makes this kind of failure undiagnosable from either end.
            console.error(
                'Mark all as read: %d of %d failed',
                failures.length,
                unread.length,
                failures.map(f => (f as PromiseRejectedResult).reason)
            );
        }
        return { marked: ok.size, failed: failures.length };
    };

    return { notifications, markAsRead, markAllAsRead };
};
