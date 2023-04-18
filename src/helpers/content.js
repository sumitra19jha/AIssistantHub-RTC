exports.preprocessContent = async (content) => {
    // Replace multiple spaces, tabs, and newlines with single spaces
    content = content.replace(/\s+/g, ' ');

    // Convert content to lowercase
    content = content.toLowerCase();

    // Remove special characters (keep alphanumeric characters and spaces)
    content = content.replace(/[^a-z0-9\s]+/g, '');

    // Trim leading and trailing spaces
    content = content.trim();

    return content;
}