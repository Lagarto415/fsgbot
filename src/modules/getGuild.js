module.exports = async (guildId) => {
    const fetch = (await import('node-fetch')).default;
    const backendUrl = `http://localhost:3000/fsg/${guildId}`; // Interpolated URL with guildId

    try {
        const response = await fetch(backendUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        // Return an object with the data and potentially other metadata
        return data
    } catch (error) {
        console.error('Failed to fetch data from the backend:', error);
        return { // You could also throw the error or handle it differently depending on your application's needs
            success: false,
            message: "Failed to fetch data",
            error: error.message
        };
    }
}
