self.onmessage = function handleMessageFromMain(msg) {
  const { rules, input } = msg.data;
  // 删除ass文件头
  let processedInput = input.replace(
    /^\[Script Info\][\s\S]*?Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n/,
    ""
  );
  let lineList = processedInput.split("\n");
  let ruleList = rules.split("\n");
  const length = lineList.length;
  let process = 0;

  let res = lineList.map((line, index) => {
    let newLine = line;
    if (!newLine) return newLine;
    if (!newLine.trim()) return newLine;
    ruleList.forEach((rule) => {
      if (!rule) return;
      if (!rule.trim()) return;
      let [prefix, pattern, replacement] = rule.split("\t");
      if (prefix !== "on") return;
      const reg = new RegExp(pattern, "g");
      replacement = replacement.replaceAll(/\\(\d+)/g, "$$1");

      newLine = newLine.replaceAll(reg, replacement);
    });
    // 行数超过 500 时显示进度
    if (length > 500) {
      let currentProcess = Math.floor((index / length) * 100);
      if (currentProcess !== process) {
        process = currentProcess;
        self.postMessage({ status: "process", data: process });
      }
    }
    return newLine;
  });

  process = 0;
  res = res.join("\n");
  self.postMessage({ status: "success", data: res });
};
