import * as React from 'react';
import { AppBar, AppBarProps, Link, Logout, TitlePortal, useGetIdentity, useNotify, UserMenu, useUserMenu } from 'react-admin';
import { useNavigate } from 'react-router';
import { DateTime } from "luxon";
import { Badge, IconButton, Menu, MenuItem, Typography, Box, ListItemIcon, ListItemText } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from './hooks/useNotifications';


/**
 * The three partner institutions, centred in the app bar.
 *
 * The white-on-transparent PNGs from the monitoring repo, which are made for
 * exactly this: a navy bar. Hidden below `md`, where the bar has only enough
 * room for the title and the account controls and three logos would crowd
 * both.
 */
const PARTNERS = [
    { name: 'LINKS Foundation', href: 'https://linksfoundation.com', src: '/logos/logo-links-white.png' },
    { name: 'Politecnico di Torino', href: 'https://www.polito.it', src: '/logos/logo-polito-white.png' },
    { name: 'INRIM', href: 'https://www.inrim.it', src: '/logos/logo-inrim-white.png' },
];

const PartnerLogos = () => (
    <Box
        sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 3,
            opacity: 0.92,
            transition: 'opacity 120ms',
            '&:hover': { opacity: 1 },
        }}
    >
        {PARTNERS.map((p) => (
            <Box
                key={p.name}
                component="a"
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                <Box
                    component="img"
                    src={p.src}
                    alt={p.name}
                    sx={{ height: 22, width: 'auto', display: 'block' }}
                />
            </Box>
        ))}
    </Box>
);

// It's important to pass the ref to allow Material UI to manage the keyboard navigation
// eslint-disable-next-line react/display-name
const SettingsMenuItem = React.forwardRef<HTMLAnchorElement>((props, ref) => {
    const userMenuContext = useUserMenu();
    if (!userMenuContext) {
        throw new Error("<SettingsMenuItem> should be used inside a <UserMenu>");
    }
    const { onClose } = userMenuContext;
    return (
        <MenuItem
            onClick={onClose}
            ref={ref}
            component={Link}
            to="/profile"
            // It's important to pass the props to allow Material UI to manage the keyboard navigation
            {...props}
        >
            <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
        </MenuItem>
    );
});


export const CustomAppBar = (props: AppBarProps) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const notify = useNotify();
    const unreadNotifications = notifications.filter((notification) => !notification.read)

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification: any) => {
        await markAsRead(notification.id);
        navigate(`/notifications/${notification.id}/show`);
        handleClose();
    };

    const handleMarkAllRead = async () => {
        const { marked, failed } = await markAllAsRead();
        if (failed) {
            notify(`Marked ${marked} of ${marked + failed}; ${failed} failed`, {
                type: 'warning',
            });
            return;
        }
        notify(`Marked ${marked} notification(s) as read`, { type: 'info' });
    };

    return (
        <AppBar {...props} userMenu={
            <UserMenu>
                <SettingsMenuItem />
                <Logout />
            </UserMenu>
        }>
            <TitlePortal />
            {/* A spacer either side, so the logos sit centred between the page
                title and the account controls rather than being pushed by
                whichever of the two happens to be wider. */}
            <Box flex="1" />
            <PartnerLogos />
            <Box flex="1" />
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadNotifications.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {notifications.map((notification) => {
                    const date = DateTime.fromJSDate(new Date(notification.timestamp))
                    return (
                    <MenuItem key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            selected={!notification.read}>
                        <Typography variant="body2">{date.toFormat('d LLL HH:mm')} - {notification.title}</Typography>
                    </MenuItem>
                )})}
                {notifications.length === 0 && (
                    <MenuItem disabled>No notifications</MenuItem>
                )}
                {unreadNotifications.length > 0 && (
                    /* Stays open on click: the point of the action is watching
                       the highlights clear, and there is nowhere to navigate. */
                    <MenuItem
                        onClick={handleMarkAllRead}
                        sx={{ borderTop: '1px solid #eee', justifyContent: 'center' }}
                    >
                        {/* Icon inline with the label, not ListItemIcon/Text:
                            those size for a full-width row and would push the
                            label off centre against the footer beneath it. */}
                        <DoneAllIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                            Mark all as read ({unreadNotifications.length})
                        </Typography>
                    </MenuItem>
                )}
                {notifications.length > 0 && (
                    <MenuItem
                        onClick={() => {
                            handleClose();
                            navigate('/notifications');
                        }}
                        sx={{ borderTop: '1px solid #eee', justifyContent: 'center', fontWeight: 'bold' }}
                    >
                        View all notifications
                    </MenuItem>
                )}
            </Menu>
        </AppBar>
    );
};
