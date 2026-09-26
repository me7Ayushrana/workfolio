import mammoth from 'mammoth';

export const importDocxFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        reject(new Error("Could not read file ArrayBuffer"));
        return;
      }
      
      try {
        // Convert to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });
        let html = result.value;
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '<br />');
        
        resolve(html);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("File reading error"));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
