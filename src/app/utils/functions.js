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

function formatEllipsis(str, startLength = 5, endLength = 5) {
    if (str) {
        if (str.length > startLength + endLength) {
            return str.substr(0, startLength) + '...' + str.substr(-endLength);
        }
        return str;
    }

    return '';
}

export { formatString, formatDate, formatEllipsis };