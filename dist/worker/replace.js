self.onmessage = function handleMessageFromMain(msg) {
  const { rules: ruleList, input } = msg.data;
  let lines = input.split('\n');
  let rules = ruleList.split('\n');
  let res = lines.map(line => {
    let newLine = line;
    rules.forEach(rule => {
        if (!rule.trim()) return;
        let [_, pattern, replacement] = rule.split('\t');
        const reg = new RegExp(pattern, 'g');
        replacement = replacement.replaceAll(/\\(\d+)/g, '$$1');

        newLine = newLine.replaceAll(reg, replacement);
    });
    return newLine;
  });

  res = res.join('\n');
  self.postMessage(res);
};
