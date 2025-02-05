class BookFoldingWorker {
    constructor(pages, foldAngle = 45) {
      this.pages = pages;
      this.foldAngle = foldAngle;
    }
  
    generatePattern() {
      const pattern = [];
      const pageHeight = 400; // Adjust based on book dimensions
      const pageWidth = 300;  // Adjust based on book dimensions
  
      const foldWidth = Math.tan(this.foldAngle * Math.PI / 180) * pageHeight;
  
      for (let i = 1; i <= this.pages / 2; i++) {
        const foldDepth = (i / (this.pages / 2)) * foldWidth;
        pattern.push({
          pageNumber: i,
          foldDepth: foldDepth.toFixed(2),
          description: `Fold page ${i} to ${foldDepth.toFixed(2)}mm`
        });
      }
  
      return pattern;
    }
  
    generateFoldVisualization() {
      const pattern = this.generatePattern();
      const svgHeight = 500;
      const svgWidth = 800;
  
      const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <text x="20" y="30" font-family="Arial" font-size="20">Book Folding Visualization</text>
    ${pattern.map((fold, index) => `
      <rect 
        x="100" 
        y="${100 + index * 40}" 
        width="${fold.foldDepth * 2}" 
        height="20" 
        fill="blue" 
        opacity="0.6"
      />
      <text 
        x="${100 + fold.foldDepth * 2 + 20}" 
        y="${120 + index * 40}" 
        font-family="Arial" 
        font-size="14"
      >
        Page ${fold.pageNumber}: ${fold.foldDepth}mm
      </text>
    `).join('')}
  </svg>
      `;
  
      return svg;
    }
  }
  
  // Example usage
  self.onmessage = (event) => {
    const { pages, foldAngle } = event.data;
    const worker = new BookFoldingWorker(pages, foldAngle);
    const svg = worker.generateFoldVisualization();
    self.postMessage({ svg });
  };