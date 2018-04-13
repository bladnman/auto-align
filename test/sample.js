class Sample {

  constructor() {
    let x = 5;
    let name = 'hello';
    let your_name_here='';
    if (x == 5) {}
    // time to hunt                         = yes  
  }

  align(text) {
    const lines = text.split('\n');
    let farthestAlignable = 0;
    lines.forEach(line => {
      farthestAlignable = Math.max(farthestAlignable, this._getAlignablePosition(line));
      console.log(`(${farthestAlignable}) ${line}`);
      
    });
    return `farthest alignable (${farthestAlignable})`;
  }
}
