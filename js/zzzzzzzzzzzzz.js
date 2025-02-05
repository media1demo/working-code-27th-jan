var modal_load = document.getElementById("my_modal_load");
modal_load.showModal();
    Promise.all([
      fetch('https://worried-mango-dimple.glitch.me/all-data')
        .then(response => response.json()),
      fetch('https://cdn.glitch.global/f25424ba-ba0b-4671-806e-cc2ea39ea3c7/total%20both%20the%20row.xlsx?v=1715599864725')
        .then(response => response.arrayBuffer())
        .then(data => {
          var workbook = XLSX.read(data, {type: 'array'});
          var worksheet = workbook.Sheets[workbook.SheetNames[0]];
          return XLSX.utils.sheet_to_json(worksheet);
        })
     ]).then(([data1, data2]) => {
      allData = [...data1, ...data2];
      console.log("Combined data", allData);
      allData1 = data1;
      allData2 = data2;
      console.log("Data1", allData1);
      console.log("Data2", allData2);
      document.getElementById('totalEntries').innerText = allData.length;
      
      createTable1(allData1);
      createTable2(allData2); 
  
fetch('https://highfalutin-unique-doom.glitch.me/flask-endpoint')
  .then(response => response.text()) 
  .then(text => {
    console.log('Raw response text:', text);
    return JSON.parse(text); 
  })
  .then(data => {
    console.log('Data from response.json:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
      modal_load.close()

    }).catch(error => {
  
  console.error('Error:', error);
  modal_load.close();
});
