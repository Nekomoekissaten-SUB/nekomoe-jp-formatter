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
    if (description) {
      console.log(description);
      if (description.trim() == "删除残留外字") {
        //寻找出newInput中所有符合“\[外:.+?\]”的字符串输出在console中
        let reg = new RegExp("\\[外:.+?\\]", "g");
        let result = newInput.match(reg);
        console.log("未处理外字：" + result);
      }
    }
    if (prefix !== "on") return;
    const reg = new RegExp(pattern, "g");
    replacement = replacement.replaceAll(/\\(\d+)/g, (match, p1) => "$" + p1);

    newInput = newInput.replaceAll(reg, replacement);
  });

  self.postMessage({ status: "success", data: newInput });
};
