$(document).ready(function () {
  main();
  // 自动匹配系统（浏览器）的外观模式
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    toggleDarkMode();
  }
});

async function main() {
  const rules = await fetchRules();
  if (!rules) {
    window.alert("找不到规则文件！");
  }

  let worker = initFormatterWorker("worker/replace.js");

  bindEvent(rules, worker);
}

async function fetchRules() {
  let res = await fetch("pattern.tsv");
  if (res.ok) {
    let buffer = await res.arrayBuffer();
    const text = new TextDecoder("utf-16le").decode(buffer);
    return text;
  }
  return null;
}

function bindEvent(rules, worker) {
  document.addEventListener("click", function (e) {
    switch (e.target.id) {
      case "format-btn":
        format(rules, worker);
        break;
      case "copy-jp":
        copy();
        break;
      case "download-jp":
        download();
        break;
      case "dark-mode":
        toggleDarkMode();
        break;
      default:
        break;
    }
  });
  document.addEventListener("drop", function (e) {
    e.preventDefault();
    switch (e.target.id) {
      case "input-jp":
        dragFile(e);
        break;
      default:
        break;
    }
  });
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
  });
}

function initFormatterWorker(url) {
  let worker = new Worker(url);
  worker.addEventListener("message", function (e) {
    const { status, data } = e.data;
    if (status === "success") {
      $("#output-jp").val(data);
      $("#format-btn").text("格式化").removeClass("disabled");
    } else if (status === "process") {
      $("#gaiji-alert").text(
        "发现未知外字：" +
          data +
          "，如果你确信这是一个不该删去的字符，请告知开发者。"
      );
    }
  });
  worker.addEventListener("messageerror", function (e) {
    window.alert("格式化失败！", e.message);
    console.log("格式化失败！", e.message);
    $("#format-btn").text("格式化").removeClass("disabled");
  });
  worker.onerror = (e) => {
    window.alert("格式化失败！", e.message);
    console.log("格式化失败！", e.message);
    $("#format-btn").text("格式化").removeClass("disabled");
  };
  return worker;
}

function download() {
  let dom = document.getElementById("output-jp");
  if (dom) {
    if (dom.value) {
      // 保存为文件
      // 创建隐藏的可下载链接
      const eleLink = document.createElement("a");
      eleLink.download = "jp.txt";
      eleLink.style.display = "none";
      // 字符内容转变成blob地址
      const blob = new Blob([dom.value]);
      eleLink.href = URL.createObjectURL(blob);
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();
      // 然后移除
      // URL.revokeObjectURL(eleLink.href); // 释放URL 对象
      document.body.removeChild(eleLink);
      return;
    }
  }
  window.alert("没有可保存的内容！");
}

function dragFile(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files?.length) {
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      let text = e.target.result;
      $("#input-jp").val(text);
    };
  }
}

function format(rules, worker) {
  $("#gaiji-alert").text("");
  if (!rules) {
    window.alert("缺少格式化规则！");
    return;
  }
  let dom = document.getElementById("input-jp");
  if (dom) {
    let input = dom.value;
    if (!input.trim()) {
      window.alert("没有输入文本！");
      return;
    }
    $("#format-btn").text("格式化中…").addClass("disabled");

    worker.postMessage({ rules, input });
  }
}

function copy() {
  let dom = document.getElementById("output-jp");
  if (dom) {
    if (dom.value) {
      // 选择文本内容
      dom.select();
      try {
        // 使用 execCommand 复制选中的文本到剪贴板
        document.execCommand("copy");
        window.alert("文本已成功复制到剪贴板");
      } catch (err) {
        window.alert("无法复制到剪贴板", err);
      }
      return;
    }
  }
  window.alert("没有可复制的内容！");
}

// 切换外观模式（无记忆） dark: 🌚 light: 🌞
function toggleDarkMode() {
  let selection = $("#dark-mode");
  if (selection) {
    $("body").toggleClass("dark-mode");
    $("header").toggleClass(["bg-white", "shadow-sm", "border-bottom"]);
    $("ul.text-small li a").toggleClass("link-secondary");
    $("small").filter(".d-block").toggleClass("text-muted");
    $("#contact").toggleClass("text-dark");
    // 点击时的显示的是太阳图标则切换为月亮
    selection.text() === "🌞" ? selection.html("🌚") : selection.html("🌞");
  }
}
