# Node.js DCAT Metadata Parser

This Node.js script parses DCAT metadata serialized in Turtle (TTL) format and generates an HTML report containing information about a specified dataset and its distributions.

## Usage

1. Ensure you have Node.js installed on your system. You can download it from [here](https://nodejs.org/).

2. Clone or download the repository to your local machine.

3. Install the required dependencies by running the following command in the terminal:

   ```
   npm install
   ```

4. Run the script with the following command:

   ```
   node dcat-to-htmltable.js <metadataFilePath> <datasetSubjectURI>
   ```

   Replace `<metadataFilePath>` with the path to the metadata TTL file and `<datasetSubjectURI>` with the URI of the dataset subject you want to extract information about.

5. The script will generate an HTML file named `dataset_info.html` containing the dataset information and distributions.

## Example

Suppose your `metadata.ttl` file is located in the parent directory and you want to extract information about the dataset with the URI `https://www.unitedutilities.com/corporate/responsibility/environment/natural-environment/bowland-winep/`. You would run the following command:

```
node dcat-to-htmltable.js ../metadata.ttl https://www.unitedutilities.com/corporate/responsibility/environment/natural-environment/bowland-winep/
```

The script will then generate the `dataset_info.html` file containing the dataset information and distributions.

## Additional Features

    Microdata Integration: The HTML output includes microdata annotations, making the content more machine-readable. Microdata attributes are added to the HTML tables, allowing search engines and other applications to better understand the structured data.