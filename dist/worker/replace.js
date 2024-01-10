self.onmessage = function handleMessageFromMain(msg) {
  const { rules, input } = msg.data;
  let ruleList = rules.split("\n");

  let newInput = input;
  ruleList.forEach((rule) => {
    if (!rule) return;
    if (!rule.trim()) return;
    // 如果规则以#开头，忽略此行
    if (rule.startsWith("#")) return;
    let [prefix, pattern, replacement, description] = rule.split("\t");
    console.log(description);
    if (prefix !== "on") return;
    const reg = new RegExp(pattern, "g");
    replacement = replacement.replaceAll(/\\(\d+)/g, (match, p1) => "$" + p1);

    newInput = newInput.replaceAll(reg, replacement);
  });

  self.postMessage({ status: "success", data: newInput });
};
