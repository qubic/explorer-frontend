const formatString = (string) => {
    return (string ? Number(string).toLocaleString('en-US') : "")
}

export default formatString;