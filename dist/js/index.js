$(document).ready(function () {
  main();
});

async function main() {
  const rules = await fetchRules();
  if (!rules) {
    window.alert("找不到规则文件！");
  }

  bindEvent(rules);
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

function bindEvent(rules) {
  document.addEventListener("click", function (e) {
    switch (e.target.id) {
      case "format-btn":
        format(rules);
        break;
      case "copy-jp":
        copy();
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

function format(rules) {
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
    let worker = new Worker("worker/replace.js");
    $("#format-btn").text("格式化中…").addClass("disabled");

    worker.postMessage({ rules, input });
    worker.addEventListener("message", function (e) {
      $("#output-jp").val(e.data);
      $("#format-btn").text("格式化").removeClass("disabled");
      worker.terminate();
    });
    worker.addEventListener("messageerror", function (e) {
      window.alert("格式化失败！", e.message);
      console.log("格式化失败！", e.message);
      $("#format-btn").text("格式化").removeClass("disabled");
      worker.terminate();
    });
    worker.onerror = (e) => {
      window.alert("格式化失败！", e.message);
      console.log("格式化失败！", e.message);
      $("#format-btn").text("格式化").removeClass("disabled");
      worker.terminate();
    };
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
