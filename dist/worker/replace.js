self.onmessage = function handleMessageFromMain(msg) {
  const { rules, input } = msg.data;
  let ruleList = rules.split("\n");

  let newInput = input;
  ruleList.forEach((rule) => {
    if (!rule) return;
    if (!rule.trim()) return;
    let [prefix, pattern, replacement, description] = rule.split("\t");
    if (prefix !== "on") return;
    const reg = new RegExp(pattern, "gm");
    replacement = replacement
      .replaceAll(/\\(\d+)/g, (match, p1) => "$" + p1)
      .replace(/\\n/g, "\n");
    if (description) {
      if (description.trim() === "删除残留外字") {
        let result = newInput.match(reg);
        if (result) {
          let uniqueResult = [...new Set(result)]; // 去除重复的元素
          self.postMessage({ status: "process", data: uniqueResult });
        }
      }
    }

    if (replacement.trim() == "toHalfWidth") {
      function toHalfWidth(str) {
        console.log("转换全角：" + str);
        return str
          .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 65248);
          })
          .replace(/’/g, "'")
          .replace(/　/g, " ")
          .replace(/，/g, ",")
          .replace(/．/g, ".")
          .replace(/＆/g, " & ")
          .replace(/－/g, "-")
          .replace(/／/g, "/");
      }
      newInput = newInput.replace(reg, toHalfWidth);
      return;
    }

    let oldInput;
    let counter = 0;
    // 重复替换，直到没有匹配项或替换次数超过5次
    do {
      if (counter > 0) console.log(description);
      oldInput = newInput;
      newInput = newInput.replaceAll(reg, replacement);
      counter++;
    } while (newInput !== oldInput && counter < 5);
  });

  self.postMessage({ status: "success", data: newInput });
};
