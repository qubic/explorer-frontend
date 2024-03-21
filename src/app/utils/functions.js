const formatString = (string) => {
    return (string ? Number(string).toLocaleString('en-US') : "")
}


const formatDate = (dateString) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
        hour12: true // Use 12-hour format with AM/PM
    };

    if (dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', options).format(date)
    }
    return ''
}

export { formatString, formatDate };