function laionclip() {
    const array = window.shared.imageEditorArray;
    let imageEditor = array[0];
    window.onresize = function () {
      imageEditor.ui.resizeEditor();
    };
  
    function dataURLtoBlob(dataurl) {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
  
    function showModal() {
      let modal = document.getElementById('laion-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'laion-modal';
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full';
        document.body.appendChild(modal);
      }
      modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <h3 class="text-lg font-semibold mb-4">LAION CLIP Labels</h3>
          <div id="labels-container" class="mb-4"></div>
          <div class="flex mb-4">
            <input type="text" id="label-input" class="flex-grow mr-2 p-2 border rounded" placeholder="Enter a label">
            <button id="add-label" class="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
          </div>
          <button id="submit-labels" class="w-full bg-green-500 text-white px-4 py-2 rounded mb-2">Submit</button>
          <div id="clip-result" class="mt-4"></div>
        </div>
      `;
      modal.style.display = 'block';
  
      const labelsContainer = document.getElementById('labels-container');
      const labelInput = document.getElementById('label-input');
      const addButton = document.getElementById('add-label');
      const submitButton = document.getElementById('submit-labels');
      const labels = new Set();
  
      addButton.addEventListener('click', () => {
        const label = labelInput.value.trim();
        if (label && !labels.has(label)) {
          labels.add(label);
          updateLabelsDisplay();
          labelInput.value = '';
        }
      });
  
      submitButton.addEventListener('click', () => {
        if (labels.size > 0) {
          sendImageToServer(Array.from(labels).join(','), 0);
        } else {
          alert('Please add at least one label.');
        }
      });
  
      function updateLabelsDisplay() {
        labelsContainer.innerHTML = Array.from(labels).map(label => 
          `<span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">${label}</span>`
        ).join('');
      }
    }
  
    function sendImageToServer(candidateLabels, retryCount) {
      const dataUrl = imageEditor.toDataURL();
      const formData = new FormData();
      const editedImageBlob = dataURLtoBlob(dataUrl);
      formData.append("image_file", editedImageBlob, "editedImage.png");
      formData.append("candidate_labels", candidateLabels);
  
      document.getElementById('clip-result').innerHTML = '<div class="text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>';
  
      fetch("https://ciasimbaya-objectdetection-anushreep774.glitch.me/laionclip", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.error && data.error.includes("Model") && data.error.includes("loading")) {
            const estimatedTime = data.estimated_time || 20;
            document.getElementById('clip-result').innerHTML = `<p>Model is loading. Retrying in ${estimatedTime} seconds...</p>`;
            setTimeout(() => sendImageToServer(candidateLabels, retryCount + 1), estimatedTime * 1000);
          } else {
            displayResults(data);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          if (retryCount < 3) {
            const backoffTime = Math.pow(2, retryCount) * 1000;
            document.getElementById('clip-result').innerHTML = `<p>Error occurred. Retrying in ${backoffTime/1000} seconds...</p>`;
            setTimeout(() => sendImageToServer(candidateLabels, retryCount + 1), backoffTime);
          } else {
            document.getElementById('clip-result').innerHTML = `<p>Error: ${error.message}. Max retries reached.</p>`;
          }
        });
    }
  
    function displayResults(data) {
      let resultHTML = '<h4 class="font-semibold mb-2">Results:</h4>';
      if (Array.isArray(data.scores)) {
        resultHTML += '<ul class="list-disc pl-5">';
        data.scores.forEach((score, index) => {
          resultHTML += `<li>${data.labels[index]}: ${(score * 100).toFixed(2)}%</li>`;
        });
        resultHTML += '</ul>';
      } else {
        resultHTML += `<p>${JSON.stringify(data)}</p>`;
      }
      document.getElementById('clip-result').innerHTML = resultHTML;
    }
  
    showModal();
  }
  