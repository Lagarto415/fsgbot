
module.exports = async (data) => {
    const port = process.env.DBPORT || 3000;
  
    try {
      const response = await fetch(`http://localhost:${port}/fsg/update/${data.number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log('Successfully updated all items');
    } catch (error) {
      console.error('Failed to update all items:', error);
      throw error;
    }
  };
  