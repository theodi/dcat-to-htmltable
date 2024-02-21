const N3 = require('n3');
const fs = require('fs');

// Extract command-line arguments
const args = process.argv.slice(2);
const metadataFilePath = args[0];
const datasetSubjectURI = args[1];

// Read the DCAT TTL file
const ttlData = fs.readFileSync(metadataFilePath, 'utf-8');

// Initialize N3 parser
const parser = new N3.Parser();

// Parse the TTL data
const store = new N3.Store();
parser.parse(ttlData, (error, quad, prefixes) => {
    if (error) {
        console.error('Error parsing TTL data:', error);
        return;
    }

    // Add quad to store
    if (quad)
        store.addQuad(quad);
    else {
        // Initialize data structures
        const datasetInfo = {};
        const distributions = [];

        // Process the parsed data
        store.getQuads(null, null, null).forEach(quad => {
            const subject = quad.subject.value;
            const predicate = quad.predicate.value;
            const object = quad.object;

            // Check if object is a blank node
            if (object.termType === 'BlankNode') {
                // Create nested table for blank node
                if (predicate === 'http://www.w3.org/ns/dcat#distribution') {
                    distributions[object.value] = distributions[object.value] || {};
                } else {
                    datasetInfo[predicate] = datasetInfo[predicate] || {};
                    datasetInfo[predicate][object.value] = {};
                }
                store.getQuads(object, null, null).forEach(innerQuad => {
                    if (predicate === 'http://www.w3.org/ns/dcat#distribution') {
                        distributions[object.value][innerQuad.predicate.value] = innerQuad.object.value;
                    } else {
                        datasetInfo[predicate][object.value][innerQuad.predicate.value] = innerQuad.object.value;
                    }
                });
            } else {
                // Extract dataset information for the specified dataset subject URI
                if (subject === datasetSubjectURI) {
                    datasetInfo[predicate] = datasetInfo[predicate] || [];
                    datasetInfo[predicate].push(object.value);
                }

                // Extract distribution information
                if (predicate === 'http://www.w3.org/ns/dcat#distribution') {
                    const distribution = {};
                    distributions.push(distribution);
                    if (object.termType === 'NamedNode') {
                        distribution['distributionURI'] = object.value;
                    }
                }
            }
        });

        // Generate HTML table for dataset information
        let html = '<h2>Dataset Information</h2><table border="1" itemscope itemtype="http://schema.org/Dataset">';
        Object.keys(datasetInfo).forEach(key => {
            const label = extractLabel(key);
            html += `<tr><td><a href="${key}" target="_blank">${label}</a></td><td itemprop="${key}">`;
            if (typeof datasetInfo[key] === 'object' && !Array.isArray(datasetInfo[key])) {
                Object.keys(datasetInfo[key]).forEach(subKey => {
                    //html += `<h3>${extractLabel(subKey)}</h3>`;
                    html += `<table border="1" itemscope itemtype="http://schema.org/PropertyValue">`;
                    Object.keys(datasetInfo[key][subKey]).forEach(subSubKey => {
                        html += `<tr itemprop="${subSubKey}"><td>${extractLabel(subSubKey)}</td><td>${formatValue(subSubKey, datasetInfo[key][subKey][subSubKey])}</td></tr>`;
                    });
                    html += `</table>`;
                });
            } else {
                html += Array.isArray(datasetInfo[key]) ? formatValue(key, datasetInfo[key].join(', ')) : formatValue(key, datasetInfo[key]);
            }
            html += `</td></tr>`;
        });
        html += '</table>';

        const distributionsArray = Object.keys(distributions).map(key => distributions[key]);
        // Generate HTML table for distribution information
        html += '<h2>Distributions</h2>';
        // Iterate over the distributions array
        distributionsArray.forEach((distribution, index) => {
            html += `<h3>Distribution ${index + 1}</h3><table border="1" itemscope itemtype="http://schema.org/DataDownload">`;
            Object.keys(distribution).forEach(key => {
                const label = extractLabel(key);
                html += `<tr><td><a href="${key}" target="_blank">${label}</a></td><td itemprop="${key}">${formatValue(key, distribution[key])}</td></tr>`;
            });
            html += '</table>';
        });

        // Write the HTML to a file or display it in the console
        fs.writeFileSync('dataset_info.html', html);
        console.log('HTML table generated successfully.');
    }
});

// Function to extract label from URI
function extractLabel(uri) {
    const parts = uri.split(/[#/]/);
    return parts[parts.length - 1].replace(/^[a-z]/, match => match.toUpperCase());
}

// Function to format value
function formatValue(predicate, value) {
    if (predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
        label = extractLabel(value);
        return `<a href="${value}" target="_blank">${label}</a>`;
    }
    if (typeof value === 'string' && value.startsWith('http')) {
        return `<a href="${value}" target="_blank">${value}</a>`;
    }
    return value;
}