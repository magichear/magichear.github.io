document.addEventListener("DOMContentLoaded", function () {
  var searchBoxContainer = document.querySelector(".search-box-component");
  // 显示逻辑
  if (searchBoxContainer) {
    searchBoxContainer.innerHTML = `
            <form action="https://cn.bing.com/search" method="get" target="_self" style="display: flex; width: 100%; height: 100%;">
                <div style="flex: 8.5; padding: 0px; position: relative;">
                    <input type="text" class="search-input" name="q" placeholder="请输入要搜索的内容：" autofocus style="width: 100%; height: 50px; border: 0;"/>
                    <div class="clear-button" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: none; cursor: pointer;">X</div>
                </div>
                <div style="flex: 1.5; padding: 0px;">
                    <input type="submit" class="search-button" value="搜索" style="width: 100%; height: 100%;"/>
                </div>
            </form>
        `;
    // 清除输入逻辑
    var searchInput = searchBoxContainer.querySelector(".search-input");
    var clearButton = searchBoxContainer.querySelector(".clear-button");

    // 显示清除按钮
    searchInput.addEventListener("input", function () {
      if (searchInput.value.length > 0) {
        clearButton.style.display = "block";
      } else {
        clearButton.style.display = "none";
      }
    });

    // 清除输入内容
    clearButton.addEventListener("click", function () {
      searchInput.value = "";
      clearButton.style.display = "none";
      searchInput.focus(); // 重新聚焦到输入框
    });
  }
});
