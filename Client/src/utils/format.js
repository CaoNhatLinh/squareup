export const formatDate = (dateString) => {
if (!dateString) return '';
const date = new Date(dateString);
return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

export const formatTime = (timeString) =>{
    if(!timeString)
        return ''
    return timeString;
}