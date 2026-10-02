import { useState, useEffect } from 'react';
import { useDataProvider } from 'react-admin';
import { Card, CardContent, CardHeader } from '@mui/material';

const ActiveAnnouncements = () => {
    const dataProvider = useDataProvider();
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        dataProvider.getList('activeAnnouncements', {})
            .then(({ data }) => {
                console.log('announcements: ', data)
                setAnnouncements(data);
            })
            .catch(error => {
                console.log(error)
            })
    }, [dataProvider]);
    

    return (
  <>
  {/* flexShrink:0 — the dashboard content area is a flex column, and the tall
      calendar below would otherwise squeeze these cards, clipping their text
      (MUI Card defaults to overflow:hidden). Keep them at full height. */}
  {announcements.length ? (<Card sx={{ flexShrink: 0 }}><CardHeader title="Announcements" /></Card>) : <></>}
    {announcements.map(announcement => {
      return (
      <Card key={announcement.id} sx={{ flexShrink: 0 }}>
        <CardHeader title={announcement.title} />
        <CardContent>
            <div
          dangerouslySetInnerHTML={{ __html: announcement.description }}
        />
        </CardContent>
    </Card>)
    })}
  </>
)}

export default ActiveAnnouncements