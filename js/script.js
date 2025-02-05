// const form = document.getElementById('data-form');

// form.addEventListener('submit', async (event) => {
//   event.preventDefault();
//   await processAndSubmitData(event);
// });

// async function processAndSubmitData(event) {
//   try {
//     // Fetch and process the Excel data
//     const excelResponse = await fetch('https://cdn.glitch.global/f25424ba-ba0b-4671-806e-cc2ea39ea3c7/total%20both%20the%20row.xlsx?v=1715599864725');
//     const excelData = await excelResponse.arrayBuffer();
//     const workbook = XLSX.read(excelData, { type: 'array' });
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     const excelDataJson = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
//     console.log(excelDataJson);

//     // Add the Excel data to the form data
//     const formData = new FormData(event.target);
//     formData.append('excelData', JSON.stringify(excelDataJson));

//     // Send the form data and Excel data to the server
//     const data = {};
//     for (const [key, value] of formData.entries()) {
//       data[key] = value;
//       console.log(data[key]);
//       console.log(value);
//     }
//     // console.log(data);
//     const response = await fetch('https://spring-picayune-derby.glitch.me/append', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     });
//     const result = await response.json();
//     console.log(result);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

const form = document.getElementById('data-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await processAndSubmitData();
});

async function processAndSubmitData() {
  try {

    const excelResponse = await fetch('https://cdn.glitch.global/f25424ba-ba0b-4671-806e-cc2ea39ea3c7/total%20both%20the%20row.xlsx?v=1715599864725');
    const excelData = await excelResponse.arrayBuffer();
    const workbook = XLSX.read(excelData, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelDataJson = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    const response = await fetch('https://spring-picayune-derby.glitch.me/append', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(excelDataJson)
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}