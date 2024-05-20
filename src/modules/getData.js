module.exports = async () => {
    const fetch = (await import('node-fetch')).default;
    const backendUrl = 'http://localhost:3000/fsg/data'; // Adjust this URL if necessary

    try {
        const response = await fetch(backendUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        // Ensure this is an array
        if (!Array.isArray(data)) {
            throw new Error('Expected an array of data');
        }
        return data;
    } catch (error) {
        console.error('Failed to fetch data from the backend:', error);
        return []; // Return an empty array in case of an error
    }
}
