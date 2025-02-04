echo "Replacing App.js"
cat > src/App.js <<EOF
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [usage, setUsage] = useState(1);
    const [cost, setCost] = useState(null);

    useEffect(() => {
        async function fetchAWSResources() {
            const serviceList = ['AmazonEC2', 'AmazonRDS', 'AmazonS3', 'AWSLambda'];
            setServices(serviceList);
            setSelectedService(serviceList[0]);
        }
        fetchAWSResources();
    }, []);

    async function fetchAWSCost(service) {
        try {
            const response = await fetch(\`https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/\${service}/index.json\`);
            const data = await response.json();
            return extractPrice(data);
        } catch (error) {
            console.error("Error fetching AWS pricing:", error);
            return null;
        }
    }

    function extractPrice(data) {
        const priceList = Object.values(data.terms.OnDemand);
        if (priceList.length > 0) {
            return parseFloat(Object.values(priceList[0].priceDimensions)[0].pricePerUnit.USD);
        }
        return null;
    }

    async function calculateCost() {
        if (!selectedService) return;
        const pricePerUnit = await fetchAWSCost(selectedService);
        if (pricePerUnit) {
            setCost((pricePerUnit * usage).toFixed(2));
        } else {
            setCost("Failed to fetch pricing data.");
        }
    }

    return (
        <div className="container">
            <h2>AWS COST Calculator by Dev-Ops-Karan</h2>
            <label>Select AWS Resource:</label>
            <select onChange={(e) => setSelectedService(e.target.value)} value={selectedService}>
                {services.map((service, index) => (
                    <option key={index} value={service}>{service}</option>
                ))}
            </select>
            <label>Usage (Hours/Month or GB):</label>
            <input type="number" value={usage} onChange={(e) => setUsage(e.target.value)} />
            <button onClick={calculateCost}>Calculate Cost</button>
            {cost && <div id="result">Estimated Monthly Cost: ${cost}</div>}
        </div>
    );
}

export default App;
EOF
