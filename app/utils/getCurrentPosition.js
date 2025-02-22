import axios from 'axios';

const getLocationDetails = async (latitude, longitude) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
                'User-Agent': 'JourneyTrailCommuter/1.0 (your.email@example.com)'
            }
        });
        const data = response.data;

        if (data && data.display_name) {
            return data.display_name;
        } else {
            throw new Error('No address found');
        }
    } catch (error) {
        // console.error('Error fetching address:', error.message);
    }
};

export default getLocationDetails;