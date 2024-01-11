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
    if (prefix !== "on") return;
    const reg = new RegExp(pattern, "gm");
    replacement = replacement
      .replaceAll(/\\(\d+)/g, (match, p1) => "$" + p1)
      .replace(/\\n/g, "\n");
    if (description) {
      console.log(description);
      if (description.trim() === "删除残留外字") {
        //寻找出newInput中所有符合“\[外:.+?\]”的字符串输出在console中
        let result = newInput.match(reg);
        if (result) console.log("未处理外字：" + result);
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
          .replace(/／/g, "/");
      }
      newInput = newInput.replace(reg, toHalfWidth);
      return;
    }

    newInput = newInput.replaceAll(reg, replacement);
  });

  self.postMessage({ status: "success", data: newInput });
};
