const readFileAsync = (file): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      const { result } = reader;

      if (!result || typeof result === 'string') return;
      resolve(result);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  })
}

export {
  readFileAsync
}
